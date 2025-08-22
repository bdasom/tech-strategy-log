# Dasom — Tech/Service Strategy Log (Static + Google Drive Sync)

Local-first note archive with optional Google Drive sync (JSON).  
Works offline; when signed in, backs up to Drive and syncs across devices.

## Files
- `index.html` — UI + Google Identity/Drive hooks
- `app.js` — Local storage, filters, exports, and Drive REST sync
- (Tailwind via CDN, no build step)

## Quick Start (Local)
1. Open `index.html` in a browser.
2. Capture notes in **Capture** tab; browse in **Archive**.
3. Use Export/Import for local backups.

## Google Drive Sync
- Buttons in the top-right:
  - **Google 로그인** — sign in (scope: `drive.file`)
  - **Drive에 백업** — uploads/updates `tech-strategy-log.json`
  - **Drive에서 불러오기** — downloads JSON and **merges** with local

### OAuth Setup (once)
1. Google Cloud Console → create project → **OAuth consent screen** (External, add your Gmail as Test user).
2. Create **OAuth Client ID (Web application)**:
   - Authorized JS origins: your local/dev and deployed domains (e.g., `http://localhost:5500`, `https://<project>.vercel.app`)
   - (Optional) Redirect URI (not required for token client)
3. Put your **Client ID** into `app.js` (`G_CLIENT_ID`).
4. In Testing mode, only Test users can sign in; for personal use that's enough.

### Notes
- Scope `drive.file` lets the app access files it created; safe-by-default.
- The JSON lives in your Drive root; rename/move is OK (the app re-finds by name).
- Merge logic is **by id**; duplicates are avoided.

## Deploy
- **GitHub Pages / Vercel / Netlify** — just upload these two files.
- No build step needed.

## Troubleshooting
- “앱 확인되지 않음” warning in Testing → proceed (for Test users).
- Token errors → re-click “Google 로그인”.
- 404/empty → ensure `index.html` is at repo root and Vercel build has no output dir set.
