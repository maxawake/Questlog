# Questlog (Expo app)

The Android/iOS client for Questlog, a self-hosted quest journal for everyday
life. It is built with [Expo](https://expo.dev) and [expo-router](https://docs.expo.dev/router/introduction)
and ports every feature of the web app in [`questlog/dist`](../questlog/dist)
to React Native: main quests, side quests, nested subquests with progress
tracking, journals, search and filters, a local demo mode, and a connected
mode that talks to the Python/FastAPI CalDAV adapter in [`questlog/`](../questlog)
for Nextcloud-backed sync and sharing.

## Features

- **Local demo mode.** Sample quests and journals persist on-device
  (`AsyncStorage`) so the app is fully usable offline, with no server.
- **Main quests, side quests, and nested subquests.** Subquests can nest
  arbitrarily deep; a parent's progress bar reflects every descendant.
- **Journals.** Create new journals and switch between them from the
  navigation drawer.
- **Filters and search.** Filter by all/main/side/completed quests and search
  quest titles and descriptions.
- **Connect to your Questlog server.** Enter your self-hosted server's
  address, then sign in with your Nextcloud username and an app password to
  sync and share journals, exactly like the web app.
- **Offline awareness.** The app detects connectivity loss and pauses writes
  while still showing the last loaded journal.
- **Sharing info and settings.** Mirrors the web app's sharing guidance and
  settings screen, including exporting a JSON backup of your journal (shared
  via the system share sheet).

## Connecting to a server

Unlike the bundled web frontend, this app is not served by `server.py` from
the same origin, so it asks for your server's address explicitly. Open
**Connect your world** from the sidebar or Settings, enter your server's URL
(for example `https://questlog.example.com`), then sign in with your
Nextcloud username and an app password generated under Nextcloud
**Settings → Security**. See the [root README](../questlog/README.md) for how
to deploy that server.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Run `npx expo export --platform android` to produce a release JS bundle, or
use [EAS Build](https://docs.expo.dev/build/introduction/) for an installable
`.apk`/`.aab`.

## Project layout

- `app/` – expo-router screens (`_layout.tsx` wraps the app in the Questlog
  provider; `index.tsx` is the single main screen).
- `components/` – UI: the quest board, cards, sidebar drawer, top bar, and the
  dialogs (`components/dialogs/`) used for creating/editing quests and
  journals, connecting to a server, sharing, and settings.
- `lib/model.ts` – the quest tree helpers (`descendants`, `progress`, `roots`)
  and demo data, ported 1:1 from `questlog/dist/model.js`.
- `lib/api.ts` – a typed client for the server's `/api/*` endpoints.
- `lib/questlog-store.tsx` – the app's state and actions (data, filters,
  mutations, sync), ported from `questlog/dist/app.js`.
- `constants/theme.ts` – the single color palette ported from
  `questlog/dist/styles.css` (the product has no dark mode).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Questlog server and protocol docs](../questlog/README.md)
