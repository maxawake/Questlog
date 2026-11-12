import base64
import os
import secrets
import time
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import quote, urljoin, urlsplit
from uuid import uuid4
from xml.sax.saxutils import escape

import httpx
from defusedxml.ElementTree import fromstring
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from icalendar import Calendar, Todo
from pydantic import BaseModel


NEXTCLOUD_URL = os.environ.get("NEXTCLOUD_URL", "").rstrip("/")
PUBLIC_ORIGIN = os.environ.get("PUBLIC_ORIGIN", "").rstrip("/")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() == "true"
SESSION_SECONDS = 8 * 60 * 60
NS = {"d": "DAV:", "c": "urn:ietf:params:xml:ns:caldav"}
XML_HEAD = '<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop>'
QUERY = ('<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop>'
         '<d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR">'
         '<c:comp-filter name="VTODO"/></c:comp-filter></c:filter></c:calendar-query>')
app = FastAPI(title="Questlog", docs_url=None, redoc_url=None)


@dataclass
class Session:
    username: str
    password: str
    csrf: str = field(default_factory=lambda: secrets.token_urlsafe(32))
    expires: float = field(default_factory=lambda: time.time() + SESSION_SECONDS)
    principal: str = ""
    home: str = ""
    lists: dict = field(default_factory=dict)


sessions: dict[str, Session] = {}


class Login(BaseModel):
    username: str
    password: str


class ListInput(BaseModel):
    title: str


class QuestInput(BaseModel):
    list_id: str
    title: str
    description: str = ""
    kind: str = "main"
    parent: str | None = None
    due: str | None = None


class QuestPatch(BaseModel):
    list_id: str
    etag: str
    title: str | None = None
    description: str | None = None
    kind: str | None = None
    parent: str | None = None
    due: str | None = None
    completed: bool | None = None


class QuestDelete(BaseModel):
    list_id: str
    etag: str


def same_server(href: str) -> str:
    absolute = urljoin(NEXTCLOUD_URL + "/", href)
    if urlsplit(absolute).netloc != urlsplit(NEXTCLOUD_URL).netloc:
        raise HTTPException(502, "Nextcloud returned a resource on another server.")
    if urlsplit(absolute).scheme != urlsplit(NEXTCLOUD_URL).scheme:
        raise HTTPException(502, "Nextcloud returned a different connection protocol.")
    return absolute


async def dav(session: Session, method: str, href: str, body=None, headers=None):
    request_headers = {"Content-Type": "application/xml; charset=utf-8", **(headers or {})}
    async with httpx.AsyncClient(timeout=25, follow_redirects=False) as client:
        result = await client.request(method, same_server(href), content=body, headers=request_headers,
                                      auth=(session.username, session.password))
    if result.status_code in (401, 403):
        raise HTTPException(result.status_code, "Nextcloud denied access. Check your account and list permissions.")
    if result.status_code == 412:
        raise HTTPException(409, "This quest changed on another device. Refresh it before saving again.")
    if result.status_code == 404:
        raise HTTPException(404, "This quest or journal no longer exists in Nextcloud.")
    if result.status_code >= 300:
        raise HTTPException(502, f"Nextcloud returned HTTP {result.status_code}.")
    return result


def properties(document):
    for item in fromstring(document).findall("d:response", NS):
        prop = {}
        for status in item.findall("d:propstat", NS):
            if " 200 " in status.findtext("d:status", "", NS):
                node = status.find("d:prop", NS)
                if node is not None:
                    prop.update({child.tag: child for child in node})
        yield item.findtext("d:href", "", NS), prop


async def propfind(session, href, props, depth="0"):
    result = await dav(session, "PROPFIND", href, XML_HEAD + props + "</d:prop></d:propfind>",
                       {"Depth": depth})
    return list(properties(result.content))


def property_href(props, name):
    node = props.get(name)
    return node.findtext("d:href", "", NS) if node is not None else ""


async def discover(session):
    rows = await propfind(session, NEXTCLOUD_URL + "/remote.php/dav/", "<d:current-user-principal/>")
    session.principal = next((property_href(p, "{DAV:}current-user-principal") for _, p in rows), "")
    if not session.principal:
        raise HTTPException(502, "Could not discover your Nextcloud account.")
    rows = await propfind(session, session.principal, "<c:calendar-home-set/>")
    session.home = next((property_href(p, "{urn:ietf:params:xml:ns:caldav}calendar-home-set") for _, p in rows), "")
    if not session.home:
        raise HTTPException(502, "Enable Calendar or Tasks on your Nextcloud server first.")
    return await discover_lists(session)


async def discover_lists(session):
    props = ("<d:displayname/><d:resourcetype/><d:current-user-privilege-set/><d:owner/>"
             "<c:supported-calendar-component-set/>")
    rows = await propfind(session, session.home, props, "1")
    lists = {}
    for href, prop in rows:
        components = prop.get("{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set")
        if components is None or not any(c.attrib.get("name") == "VTODO" for c in components):
            continue
        privileges = prop.get("{DAV:}current-user-privilege-set")
        granted = {n.tag for n in privileges.iter()} if privileges is not None else set()
        readonly = not bool(granted & {"{DAV:}write", "{DAV:}all", "{DAV:}write-content"})
        title = prop.get("{DAV:}displayname")
        owner = property_href(prop, "{DAV:}owner")
        identity = base64.urlsafe_b64encode(href.encode()).decode().rstrip("=")
        lists[identity] = {"id": identity, "title": title.text if title is not None else "Untitled journal",
                           "href": href, "readonly": readonly,
                           "shared": bool(owner and owner.rstrip("/") != session.principal.rstrip("/"))}
    session.lists = lists
    return list(lists.values())


def get_session(request, write=False):
    identity = request.cookies.get("questlog_session", "")
    session = sessions.get(identity)
    if not session or session.expires < time.time():
        sessions.pop(identity, None)
        raise HTTPException(401, "Sign in to Nextcloud to continue.")
    if write and not secrets.compare_digest(request.headers.get("x-csrf-token", ""), session.csrf):
        raise HTTPException(403, "Your session changed. Reload and try again.")
    return session


def get_list(session, list_id, write=False):
    journal = session.lists.get(list_id)
    if not journal:
        raise HTTPException(404, "This journal is not available to your account. Refresh your journals.")
    if write and journal["readonly"]:
        raise HTTPException(403, "This journal is shared with read-only access.")
    return journal


def decode_task(calendar, journal, href, etag):
    todos = calendar.walk("VTODO")
    if not todos:
        return None
    todo = next((item for item in todos if "RECURRENCE-ID" not in item), todos[0])
    relations = todo.get("RELATED-TO", [])
    relations = relations if isinstance(relations, list) else [relations]
    parent = next((str(r) for r in relations if r.params.get("RELTYPE", "PARENT") == "PARENT"), None)
    due = todo.get("DUE")
    due_value = due.dt if due is not None else None
    if isinstance(due_value, datetime):
        due_value = due_value.date()
    recurring = "RRULE" in todo or "RECURRENCE-ID" in todo or len(todos) > 1
    quest = {"id": str(todo.get("UID", "")), "title": str(todo.get("SUMMARY", "Untitled quest")),
             "description": str(todo.get("DESCRIPTION", "")), "parent": parent,
             "kind": "side" if str(todo.get("X-QUESTLOG-KIND", "main")) == "side" else "main",
             "completed": str(todo.get("STATUS", "")) == "COMPLETED", "due": str(due_value) if due_value else None,
             "list_id": journal["id"], "etag": etag, "readonly": journal["readonly"] or recurring,
             "recurring": recurring}
    return {"quest": quest, "calendar": calendar, "todo": todo, "href": href}


async def read_quests(session, journal):
    result = await dav(session, "REPORT", journal["href"], QUERY, {"Depth": "1"})
    records = []
    for href, props in properties(result.content):
        data = props.get("{urn:ietf:params:xml:ns:caldav}calendar-data")
        tag = props.get("{DAV:}getetag")
        if data is not None and data.text:
            try:
                record = decode_task(Calendar.from_ical(data.text), journal, href, tag.text if tag is not None else "")
            except (ValueError, TypeError) as error:
                raise HTTPException(502, "A task could not be read. Check it in Nextcloud Tasks.") from error
            if record:
                records.append(record)
    return records


def valid_parent(records, parent, uid=None):
    if not parent:
        return
    by_id = {r["quest"]["id"]: r["quest"] for r in records}
    if parent not in by_id:
        raise HTTPException(409, "The parent quest no longer exists in this journal.")
    visited = {uid} if uid else set()
    while parent and parent in by_id:
        if parent in visited:
            raise HTTPException(409, "A quest cannot be its own ancestor.")
        visited.add(parent)
        parent = by_id[parent]["parent"]


def apply_fields(todo, values):
    names = {"title": "SUMMARY", "description": "DESCRIPTION", "kind": "X-QUESTLOG-KIND"}
    for key, prop in names.items():
        if key in values:
            todo.pop(prop, None)
            if values[key] is not None:
                todo.add(prop, values[key])
    if "parent" in values:
        existing = todo.pop("RELATED-TO", [])
        existing = existing if isinstance(existing, list) else [existing]
        for relation in existing:
            if relation.params.get("RELTYPE", "PARENT") != "PARENT":
                todo.add("RELATED-TO", relation)
        if values["parent"]:
            todo.add("RELATED-TO", values["parent"], parameters={"RELTYPE": "PARENT"})
    if "due" in values:
        previous = todo.get("DUE")
        previous_date = previous.dt if previous is not None else None
        previous_date = previous_date.date() if isinstance(previous_date, datetime) else previous_date
        if values["due"] != (str(previous_date) if previous_date else None):
            todo.pop("DUE", None)
            if values["due"]:
                todo.pop("DURATION", None)
                new_date = date.fromisoformat(values["due"])
                start = todo.get("DTSTART")
                template = previous.dt if previous is not None else start.dt if start is not None else None
                due = template.replace(year=new_date.year, month=new_date.month, day=new_date.day) \
                    if isinstance(template, datetime) else new_date
                todo.add("DUE", due)
    if "completed" in values:
        todo.pop("STATUS", None)
        todo.pop("COMPLETED", None)
        todo.pop("PERCENT-COMPLETE", None)
        todo.add("STATUS", "COMPLETED" if values["completed"] else "NEEDS-ACTION")
        todo.add("PERCENT-COMPLETE", 100 if values["completed"] else 0)
        if values["completed"]:
            todo.add("COMPLETED", datetime.now(timezone.utc))
    for prop in ("DTSTAMP", "LAST-MODIFIED"):
        todo.pop(prop, None)
        todo.add(prop, datetime.now(timezone.utc))
    sequence = int(todo.pop("SEQUENCE", 0))
    todo.add("SEQUENCE", sequence + 1)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("origin")
        expected = PUBLIC_ORIGIN or str(request.base_url).rstrip("/")
        if origin and origin != expected:
            return JSONResponse({"detail": "This request came from a different site."}, status_code=403)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
    )
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(httpx.HTTPError)
async def connection_error(request, error):
    message = "Nextcloud is unreachable. Refresh your journal to confirm its latest state before trying again."
    return JSONResponse({"detail": message}, status_code=502)


@app.get("/api/config")
async def config():
    return {"backend": True, "configured": bool(NEXTCLOUD_URL), "nextcloud_url": NEXTCLOUD_URL}


@app.post("/api/login")
async def login(body: Login, request: Request, response: Response):
    if not NEXTCLOUD_URL:
        raise HTTPException(503, "Set NEXTCLOUD_URL on your Questlog server first.")
    session = Session(body.username, body.password)
    journals = await discover(session)
    for identity in [key for key, value in sessions.items() if value.expires < time.time()]:
        del sessions[identity]
    sessions.pop(request.cookies.get("questlog_session", ""), None)
    identity = secrets.token_urlsafe(48)
    sessions[identity] = session
    response.set_cookie("questlog_session", identity, httponly=True, secure=COOKIE_SECURE,
                        samesite="strict", max_age=SESSION_SECONDS)
    return {"username": session.username, "csrf": session.csrf, "lists": journals}


@app.get("/api/session")
async def account(request: Request):
    session = get_session(request)
    return {"username": session.username, "csrf": session.csrf, "lists": await discover_lists(session)}


@app.post("/api/logout")
async def logout(request: Request, response: Response):
    get_session(request, True)
    sessions.pop(request.cookies.get("questlog_session", ""), None)
    response.delete_cookie("questlog_session", secure=COOKIE_SECURE, httponly=True, samesite="strict")
    return {"ok": True}


@app.get("/api/lists")
async def lists(request: Request):
    return await discover_lists(get_session(request))


@app.post("/api/lists")
async def create_list(body: ListInput, request: Request):
    session = get_session(request, True)
    href = session.home.rstrip("/") + "/questlog-" + uuid4().hex + "/"
    xml = ('<c:mkcalendar xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:set><d:prop>'
           f'<d:displayname>{escape(body.title)}</d:displayname><c:supported-calendar-component-set>'
           '<c:comp name="VTODO"/><c:comp name="VEVENT"/></c:supported-calendar-component-set>'
           '</d:prop></d:set></c:mkcalendar>')
    await dav(session, "MKCALENDAR", href, xml)
    return await discover_lists(session)


@app.get("/api/quests")
async def quests(list_id: str, request: Request):
    session = get_session(request)
    return [r["quest"] for r in await read_quests(session, get_list(session, list_id))]


@app.post("/api/quests")
async def create_quest(body: QuestInput, request: Request):
    session = get_session(request, True)
    journal = get_list(session, body.list_id, True)
    records = await read_quests(session, journal)
    valid_parent(records, body.parent)
    uid = str(uuid4())
    calendar, todo = Calendar(), Todo()
    calendar.add("PRODID", "-//Questlog//Quest Journal//EN")
    calendar.add("VERSION", "2.0")
    todo.add("UID", uid)
    todo.add("CREATED", datetime.now(timezone.utc))
    apply_fields(todo, {**body.model_dump(), "completed": False})
    calendar.add_component(todo)
    href = journal["href"].rstrip("/") + "/" + quote(uid, safe="") + ".ics"
    await dav(session, "PUT", href, calendar.to_ical(),
              {"Content-Type": "text/calendar; charset=utf-8", "If-None-Match": "*"})
    return {"id": uid}


async def editable_record(session, list_id, uid, etag):
    records = await read_quests(session, get_list(session, list_id, True))
    record = next((r for r in records if r["quest"]["id"] == uid), None)
    if not record:
        raise HTTPException(404, "This quest was removed. Refresh the journal.")
    if record["quest"]["readonly"]:
        raise HTTPException(403, "Manage recurring tasks in Nextcloud Tasks to preserve their recurrence rules.")
    if not etag or record["quest"]["etag"] != etag:
        raise HTTPException(409, "This quest changed on another device. Refresh it before saving again.")
    return record, records


@app.patch("/api/quests/{uid}")
async def update_quest(uid: str, body: QuestPatch, request: Request):
    session = get_session(request, True)
    record, records = await editable_record(session, body.list_id, uid, body.etag)
    fields = body.model_dump(exclude_unset=True)
    if "parent" in fields:
        valid_parent(records, body.parent, uid)
    apply_fields(record["todo"], fields)
    await dav(session, "PUT", record["href"], record["calendar"].to_ical(),
              {"Content-Type": "text/calendar; charset=utf-8", "If-Match": body.etag})
    return {"ok": True}


@app.delete("/api/quests/{uid}")
async def delete_quest(uid: str, body: QuestDelete, request: Request):
    session = get_session(request, True)
    record, records = await editable_record(session, body.list_id, uid, body.etag)
    if any(r["quest"]["parent"] == uid for r in records):
        raise HTTPException(409, "Move or remove this quest's subquests first.")
    await dav(session, "DELETE", record["href"], headers={"If-Match": body.etag})
    return {"ok": True}


app.mount("/", StaticFiles(directory=Path(__file__).parent / "dist", html=True), name="app")
