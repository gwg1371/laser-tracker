# LazeTrack

A personal at-home laser / IPL hair removal tracker. Built as a mobile-first PWA — install it on your phone and use it like a native app.

## Features

- **Session logging** — track intensity level, pass count, duration, comfort rating, and notes for each treatment
- **Before/after photos** — attach a photo to any session; browse your visual progress in the Gallery
- **Progress charts** — intensity-over-time sparkline and regrowth trend chart per area
- **Google Calendar sync** — connect your Google Calendar and auto-import events named "IPL"; get browser notifications 1 hour and 24 hours before each session
- **Regrowth check-ins** — log a regrowth score (0–10) anytime to track hair reduction over time
- **Offline support** — works without internet after first load (service worker cache)
- **Export** — download all your data as JSON anytime

## Getting Started

Open [https://gwg1371.github.io/laser-tracker/](https://gwg1371.github.io/laser-tracker/) on your phone and tap **Add to Home Screen** to install.

## Google Calendar Sync Setup

To sync IPL events from your Google Calendar:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → enable **Google Calendar API**
3. Credentials → Create **OAuth 2.0 Client ID** → Web application
4. Add authorized origins / redirect URIs:
   - **JavaScript origin:** `https://gwg1371.github.io`
   - **Redirect URI:** `https://gwg1371.github.io/laser-tracker/`
5. In the app → Settings → tap **Connect Google Calendar**

After connecting, the app fetches all calendar events with "IPL" in the title and schedules notifications before each one.

## Running Locally

```bash
node server.js
# or
sh serve.sh
```

Then open `http://localhost:3000`.

## Tech Stack

- Vanilla JS, HTML, CSS — no framework, no build step
- Tailwind CSS (CDN)
- localStorage for all data
- Service Worker for offline / PWA
- Google Calendar API (OAuth2 implicit flow) for calendar sync

## Data & Privacy

All session data, photos, and settings are stored locally on your device. Nothing is sent to any server. Google Calendar access is read-only and uses your own OAuth credentials.
