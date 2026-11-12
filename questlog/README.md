Questlog

A self-hosted quest journal for everyday life. Main quests hold the bigger goals, side quests hold the little adventures, and nested subquests stay visible in the overview. The responsive web app works on desktop and mobile, with a web app manifest for installation on supported browsers.

This version uses Nextcloud for synchronization and shared lists. The downloadable app contains the complete frontend and a Python/FastAPI CalDAV adapter. The hosted preview runs the same frontend with sample data saved only in the current browser. Its sample party members are illustrative. No preview data is shared or uploaded to Nextcloud automatically.

Run it with Docker

1. Extract the archive and open the `questlog` directory in a terminal. Install Docker with Compose if it is not already available.
2. Copy `.env.example` to `.env`. Set `NEXTCLOUD_URL` to the root of your Nextcloud installation, for example `https://cloud.example.com` or `https://example.com/nextcloud`. Enable Nextcloud Calendar or Tasks. Questlog discovers calendar paths automatically.
3. Start the app with `docker compose up -d --build` and open `http://localhost:8000`. The default port is bound to localhost. Without a configured Nextcloud URL you can still explore the local demo.
4. For access from phones and other people, serve Questlog through your existing HTTPS reverse proxy or private VPN. With an HTTPS reverse proxy, set `PUBLIC_ORIGIN` to the exact public origin, such as `https://quests.example.com`, and `COOKIE_SECURE=true`. Route requests to port 8000, then recreate the container with `docker compose up -d`. Host the app at the root of its own origin, not under a URL subpath. A private network or public reverse proxy must also make the Nextcloud server reachable from the Questlog container. No credentials belong in the frontend or source repository.
5. Select “Connect your world” and sign in with your own Nextcloud username and an app password generated under Nextcloud Settings → Security. Use the exact username rather than a display name. Each device and each person signs in independently.

Share a journal

Create a journal in Questlog, then select Sharing → Manage sharing in Nextcloud. In Nextcloud Calendar, find the matching calendar and share it with an existing Nextcloud user or group. Grant edit access to collaborators, or read-only access for viewers. The other person signs in to your Questlog deployment with their own Nextcloud account; the shared journal is discovered automatically. There are no separate Questlog invitations or accounts, and you should never give another person your app password. Journal owners manage access in Nextcloud.

Nextcloud is the source of truth. Each journal is a CalDAV calendar collection and each quest is a VTODO item. `RELATED-TO;RELTYPE=PARENT` links a subquest to its parent, including deeper nesting. `X-QUESTLOG-KIND` stores main versus side quest; ordinary clients can display and complete these tasks but may not display or preserve that extra classification. Subquests inherit their parent's type when saved in Questlog. A parent's checkbox is independent of its subquest checkboxes; the progress indicator counts all descendants.

Questlog refreshes from Nextcloud every 20 seconds, on return to the app, and after saves. It pauses periodic refresh while a dialog is open or the search field has focus. Saves use ETags and `If-Match` so another person's edits are not silently overwritten. If a conflict is reported, close the editor, refresh, and reopen the quest to review the latest version. Removing a quest with children is blocked until its children are moved or removed. Unknown iCalendar fields and alarms are preserved during edits. Recurring tasks are shown read-only and should be edited in Nextcloud Tasks.

The browser only receives an opaque, HttpOnly, SameSite session cookie and a CSRF token. Nextcloud app passwords remain in the Python process memory for the authenticated session and are never written to browser storage or disk. Sessions expire after eight hours or when the app restarts. The bundled container deliberately runs one worker; multi-worker deployments require a shared session store. The server address is fixed by deployment configuration, rather than accepting arbitrary URLs from visitors. TLS verification is enabled for connections to Nextcloud.

The demo works offline and persists in local browser storage. For connected journals, this version supports reading the currently loaded view during a connection interruption; edits wait until connectivity returns. It does not queue offline writes or persist live account data across an offline reload. Nextcloud data is separate from demo data. An exported JSON snapshot is a readable archive; there is no built-in JSON import yet. Back up your Nextcloud data for recovery.

Home Assistant is not a second synchronization backend in this version. Its built-in to-do model does not expose parent-child quest relationships or the same calendar-sharing model, so Nextcloud is used for this application's synchronization. A future Home Assistant adapter could react to quest changes for household automations.

Development and verification

For a Python development setup, create a virtual environment, install `requirements.txt`, set the environment variables from `.env.example`, and run `uvicorn server:app --reload --port 8000`. `COOKIE_SECURE=false` is necessary for ordinary local HTTP development. `.env` is loaded by Docker Compose; when running Uvicorn directly, set the variables in your shell or process environment.

Install pytest and run `python -m pytest tests/test_sync.py -q`. Run `node --test tests/model.test.mjs` for the client data model. The test suite exercises nested relationships, shared reads and edits, read-only permissions, stale and racing writes, round-trip preservation, parent cycles, session isolation, CSRF, recurring task protection, and logout against a simulated CalDAV server. These are not live Nextcloud end-to-end tests. The adapter still needs verification against your Nextcloud instance and its configuration.

The frontend uses standard browser APIs and has no JavaScript dependencies or build step. Serve `dist` directly for a demo, or run the Python server to enable synchronization. The root `server.py` serves the frontend and API from the same origin, avoiding browser CalDAV CORS problems. The included `compose.yaml` and `Dockerfile` are for your own server; they are independent of the hosted preview.

Protocol references: https://github.com/nextcloud/tasks, https://docs.nextcloud.com/server/stable/user_manual/en/groupware/calendar.html, https://www.rfc-editor.org/rfc/rfc4791, https://www.rfc-editor.org/rfc/rfc5545.
