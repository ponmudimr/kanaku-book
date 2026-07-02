<div align="center">

<img src="icon-192.png" alt="Kanaku Book logo" width="96" height="96">

# Kanaku Book

**A lightweight payment-ledger PWA backed by Google Sheets.**

Replace the paper notebook: tap a name, type an amount, and the entry lands
in a Google Sheet with the date, a note, and who logged it.

[![License: MIT](https://img.shields.io/badge/License-MIT-maroon.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-blue.svg)](#-install-on-a-phone)
[![Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-green.svg)](Code.gs)
[![Hosted on GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222.svg)](https://ponmudimr.github.io/kanaku-book/)

[Live app](https://ponmudimr.github.io/kanaku-book/) · [Setup guide](docs/SETUP.md) · [Report an issue](https://github.com/ponmudimr/kanaku-book/issues)

</div>

---

## ✨ Features

- **One-tap logging** — pick a member, type the amount, save. Done in seconds.
- **Google Sheet as the database** — the sheet *is* the ledger; open it anytime to review, total, or print.
- **Multi-user login** — simple username/password auth managed straight from the sheet's `Users` tab.
- **Ledger view** — per-member totals, month and date-range search, drill-down to individual entries.
- **Safe deletes** — removing an entry requires typing `delete` to confirm, and new entries are blocked until the delete is confirmed in the sheet.
- **Installable PWA** — full-screen app on the home screen, splash screen, offline shell caching.
- **Zero build, zero dependencies** — one HTML file, one service worker, one Apps Script. Any static host works.

## 🏗 How it works

```
┌────────────┐     JSONP / fetch      ┌──────────────────┐        ┌───────────────┐
│  Phone PWA │ ─────────────────────► │ Apps Script Web  │ ─────► │ Google Sheet  │
│ index.html │ ◄───────────────────── │ App   (Code.gs)  │ ◄───── │ Users/Members │
└────────────┘      member lists,     └──────────────────┘        │   /Entries    │
                    entries, auth                                 └───────────────┘
```

- The front end is a single static page (`index.html`) served from GitHub Pages.
- A Google Apps Script web app (`Code.gs`) is the API layer; it reads and writes the spreadsheet.
- The service worker (`sw.js`) caches the app shell for instant opens, while pages themselves are fetched network-first so updates roll out on the next launch.

## 🚀 Getting started

Full step-by-step instructions (with screenshots-level detail) live in
**[docs/SETUP.md](docs/SETUP.md)**. In short:

1. **Create a Google Sheet** — the script auto-creates the `Users`, `Members`, and `Entries` tabs.
2. **Deploy `Code.gs`** as an Apps Script web app (*Execute as: Me*, *Access: Anyone*).
3. **Paste the web-app URL** into `SCRIPT_URL` in `index.html`.
4. **Host the static files** on GitHub Pages or Netlify and add the app to each phone's home screen.

## 📱 Install on a phone

- **Android (Chrome):** open the app link → **⋮ menu → Add to Home screen** → **Add**.
- **iPhone (Safari):** open the link → **Share → Add to Home Screen** → **Add**.

The app opens full-screen with its own icon and splash screen, and stays logged in until you press **Log out**.

## 📂 Project structure

| File | Purpose |
|---|---|
| `index.html` | The entire front end — UI, styles, and app logic |
| `Code.gs` | Google Apps Script backend (auth, members, entries API) |
| `sw.js` | Service worker — offline shell cache, network-first pages |
| `manifest.json` | PWA manifest (name, icons, theme) |
| `icon.png`, `icon-192.png` | App icons |
| `docs/SETUP.md` | Detailed setup and troubleshooting guide |

## 🔒 Security notes

This is **family-grade** security by design: passwords live in the sheet as
plain text and are checked by the script. It keeps honest people organized —
don't reuse an important password here, and never share the Google Sheet
itself (the app can only add entries; only the sheet owner can read or edit
the ledger).

## 📄 License

Released under the [MIT License](LICENSE).

---

<div align="center">
Designed &amp; developed by <b>Ponmudi MR</b>
</div>
