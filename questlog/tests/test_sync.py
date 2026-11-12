import base64
from xml.sax.saxutils import escape

import httpx
import pytest
from fastapi.testclient import TestClient
from icalendar import Alarm, Calendar

import server


def multistatus(rows):
    content = ''.join(f'<d:response><d:href>{escape(href)}</d:href><d:propstat><d:prop>{prop}</d:prop>'
                      '<d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>' for href, prop in rows)
    return ('<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">'
            + content + '</d:multistatus>')


@pytest.fixture
def setup(monkeypatch):
    monkeypatch.setattr(server, 'NEXTCLOUD_URL', 'https://cloud.example.test')
    monkeypatch.setattr(server, 'PUBLIC_ORIGIN', 'http://testserver')
    monkeypatch.setattr(server, 'COOKIE_SECURE', False)
    server.sessions.clear()
    remote = {'items': {}, 'revision': 0, 'bob_readonly': False, 'race': False, 'headers': []}
    home = '/remote.php/dav/calendars/'
    shared = home + 'alice/fellowship/'

    def handle(request):
        user, password = base64.b64decode(request.headers['authorization'].split()[1]).decode().split(':', 1)
        if password != 'app-password':
            return httpx.Response(401)
        path, method = request.url.path, request.method
        if method == 'PROPFIND':
            if path == '/remote.php/dav/':
                props = f'<d:current-user-principal><d:href>/principals/{user}/</d:href></d:current-user-principal>'
                return httpx.Response(207, text=multistatus([(path, props)]))
            if path == f'/principals/{user}/':
                props = f'<c:calendar-home-set><d:href>{home}{user}/</d:href></c:calendar-home-set>'
                return httpx.Response(207, text=multistatus([(path, props)]))
            privilege = 'read' if user == 'bob' and remote['bob_readonly'] else 'write'
            props = ('<d:displayname>Our fellowship</d:displayname><d:owner><d:href>/principals/alice/</d:href>'
                     '</d:owner><c:supported-calendar-component-set><c:comp name="VTODO"/>'
                     '</c:supported-calendar-component-set><d:current-user-privilege-set>'
                     f'<d:privilege><d:{privilege}/></d:privilege></d:current-user-privilege-set>')
            return httpx.Response(207, text=multistatus([(shared, props)]))
        if method == 'REPORT':
            rows = [(key, f'<d:getetag>{escape(value["etag"])}</d:getetag>'
                     f'<c:calendar-data>{escape(value["data"])}</c:calendar-data>')
                    for key, value in remote['items'].items()]
            return httpx.Response(207, text=multistatus(rows))
        if method == 'PUT':
            remote['headers'].append(dict(request.headers))
            if remote['race']:
                remote['race'] = False
                return httpx.Response(412)
            current = remote['items'].get(path)
            if current and request.headers.get('if-match') != current['etag']:
                return httpx.Response(412)
            if not current and request.headers.get('if-none-match') != '*':
                return httpx.Response(412)
            remote['revision'] += 1
            remote['items'][path] = {'data': request.content.decode(), 'etag': f'"v{remote["revision"]}"'}
            return httpx.Response(204 if current else 201)
        if method == 'DELETE':
            if request.headers.get('if-match') != remote['items'][path]['etag']:
                return httpx.Response(412)
            del remote['items'][path]
            return httpx.Response(204)
        return httpx.Response(500)

    original = httpx.AsyncClient
    monkeypatch.setattr(server.httpx, 'AsyncClient', lambda **kwargs: original(transport=httpx.MockTransport(handle), **kwargs))
    return remote


def signed_in(username='alice'):
    client = TestClient(server.app)
    response = client.post('/api/login', json={'username': username, 'password': 'app-password'})
    assert response.status_code == 200
    account = response.json()
    client.headers['X-CSRF-Token'] = account['csrf']
    return client, account['lists'][0]['id']


def create(client, journal, title='A quest', **kwargs):
    response = client.post('/api/quests', json={'list_id': journal, 'title': title, **kwargs})
    assert response.status_code == 200, response.text
    return response.json()['id']


def tasks(client, journal):
    response = client.get('/api/quests', params={'list_id': journal})
    assert response.status_code == 200
    return response.json()


def test_shared_quests_and_nested_relationships(setup):
    alice, journal = signed_in()
    parent = create(alice, journal, 'Main quest')
    child = create(alice, journal, 'Subquest', parent=parent)
    create(alice, journal, 'Nested subquest', parent=child)
    bob, shared = signed_in('bob')
    assert [q['parent'] for q in tasks(bob, shared)] == [None, parent, child]
    subquest = tasks(bob, shared)[1]
    response = bob.patch(f'/api/quests/{child}', json={'list_id': shared, 'etag': subquest['etag'], 'completed': True})
    assert response.status_code == 200
    assert tasks(alice, journal)[1]['completed'] is True


def test_stale_edits_are_rejected(setup):
    alice, journal = signed_in()
    uid = create(alice, journal)
    stale = tasks(alice, journal)[0]['etag']
    response = alice.patch(f'/api/quests/{uid}', json={'list_id': journal, 'etag': stale, 'title': 'First edit'})
    assert response.status_code == 200
    response = alice.patch(f'/api/quests/{uid}', json={'list_id': journal, 'etag': stale, 'title': 'Stale edit'})
    assert response.status_code == 409
    assert tasks(alice, journal)[0]['title'] == 'First edit'


def test_racing_server_write_is_rejected(setup):
    client, journal = signed_in()
    uid = create(client, journal)
    etag = tasks(client, journal)[0]['etag']
    setup['race'] = True
    response = client.patch(f'/api/quests/{uid}', json={'list_id': journal, 'etag': etag, 'completed': True})
    assert response.status_code == 409
    assert setup['headers'][-1]['if-match'] == etag
    assert tasks(client, journal)[0]['completed'] is False


def test_readonly_shares_are_enforced(setup):
    alice, journal = signed_in()
    uid = create(alice, journal)
    setup['bob_readonly'] = True
    bob, shared = signed_in('bob')
    quest = tasks(bob, shared)[0]
    assert quest['readonly'] is True
    response = bob.patch(f'/api/quests/{uid}', json={'list_id': shared, 'etag': quest['etag'], 'completed': True})
    assert response.status_code == 403


def test_unknown_properties_and_alarms_survive_edits(setup):
    client, journal = signed_in()
    uid = create(client, journal, 'Café, tea; and a line\nbreak', kind='side', due='2026-12-04')
    stored = next(iter(setup['items'].values()))
    calendar = Calendar.from_ical(stored['data'])
    todo = calendar.walk('VTODO')[0]
    todo.add('X-OTHER-APP-FIELD', 'keep this')
    alarm = Alarm()
    alarm.add('ACTION', 'DISPLAY')
    alarm.add('DESCRIPTION', 'Reminder')
    todo.add_component(alarm)
    stored['data'] = calendar.to_ical().decode()
    quest = tasks(client, journal)[0]
    assert quest['title'] == 'Café, tea; and a line\nbreak'
    assert quest['kind'] == 'side'
    response = client.patch(f'/api/quests/{uid}', json={'list_id': journal, 'etag': quest['etag'], 'completed': True})
    assert response.status_code == 200
    updated = Calendar.from_ical(next(iter(setup['items'].values()))['data']).walk('VTODO')[0]
    assert str(updated['X-OTHER-APP-FIELD']) == 'keep this'
    assert len(updated.walk('VALARM')) == 1
    assert str(updated['DUE'].dt) == '2026-12-04'


def test_csrf_and_session_isolation(setup):
    alice, journal = signed_in()
    anonymous = TestClient(server.app)
    assert anonymous.get('/api/lists').status_code == 401
    assert alice.get('/api/quests', params={'list_id': 'someone-elses-journal'}).status_code == 404
    alice.headers.pop('X-CSRF-Token')
    assert alice.post('/api/quests', json={'list_id': journal, 'title': 'no csrf'}).status_code == 403
    assert alice.post('/api/login', headers={'Origin': 'https://other.example'},
                      json={'username': 'alice', 'password': 'app-password'}).status_code == 403


def test_parent_cycles_and_orphaning_are_blocked(setup):
    client, journal = signed_in()
    parent = create(client, journal)
    child = create(client, journal, parent=parent)
    etag = tasks(client, journal)[0]['etag']
    response = client.patch(f'/api/quests/{parent}', json={'list_id': journal, 'etag': etag, 'parent': child})
    assert response.status_code == 409
    response = client.delete(f'/api/quests/{parent}')
    assert response.status_code == 422
    response = client.request('DELETE', f'/api/quests/{parent}', json={'list_id': journal, 'etag': etag})
    assert response.status_code == 409
    assert len(tasks(client, journal)) == 2


def test_recurring_quests_are_read_only(setup):
    client, journal = signed_in()
    uid = create(client, journal)
    stored = next(iter(setup['items'].values()))
    calendar = Calendar.from_ical(stored['data'])
    calendar.walk('VTODO')[0].add('RRULE', {'FREQ': 'DAILY'})
    stored['data'] = calendar.to_ical().decode()
    quest = tasks(client, journal)[0]
    assert quest['recurring'] is True
    response = client.patch(f'/api/quests/{uid}', json={'list_id': journal, 'etag': quest['etag'], 'completed': True})
    assert response.status_code == 403


def test_bad_password_and_logout(setup):
    client = TestClient(server.app)
    assert client.post('/api/login', json={'username': 'alice', 'password': 'wrong'}).status_code == 401
    client, journal = signed_in()
    assert client.post('/api/logout').status_code == 200
    assert client.get('/api/session').status_code == 401
    assert not server.sessions


def test_external_resource_cannot_receive_credentials(setup):
    with pytest.raises(server.HTTPException):
        server.same_server('https://different.example/steal')
