# Dasom — Tech/Service Strategy Log (Static Site)

A lightweight, local-first archive to capture daily notes on tech, services, product strategy, and global trends.  
Built as a static site so you can deploy it anywhere (GitHub Pages, Vercel, Netlify) with zero backend.

---

## ✨ Features
- Quick capture form with **Date / Language (EN·KR) / Category / Industry**
- Fields: **Read**, **Idea**, **Flow**, and a **One-liner** (핵심 한 줄)
- **Prompt of the Day** (자동으로 영어/한국어 번갈아 표시)
- **Archive**: Search, filters (category/industry/date range), stats
- **Export**: Markdown / JSON / CSV
- **Import**: JSON merge
- 100% local-first (browser localStorage). No server required.

---

## 🚀 How to use locally
1. Put these three files in the same folder:
tech-log/
├─ index.html
├─ app.js
└─ README.md
2. Double-click `index.html` to open it in Chrome/Safari/Edge.
3. Start capturing your notes.

---

## 🌍 Deploy to GitHub Pages
1. Create a new repo, e.g., `tech-strategy-log`.
2. Upload all files in this folder to the repo root.
3. In GitHub, go to **Settings → Pages** and set Source to **Deploy from a branch**, branch `main`, folder `/` (root).
4. Your site will be live at:
https://<your-username>.github.io/tech-strategy-log/

---

## ⚡ Deploy to Vercel / Netlify
- **Vercel**: Import your GitHub repo, deploy with defaults (no build step needed).
- **Netlify**: Drag and drop the folder or link your repo.

---

## 🔒 Notes
- All data is stored in your **browser localStorage**.
- To move devices, use **Export JSON** and **Import JSON**.
- For shared/team use later, you could extend it with a backend (Supabase/Firebase/Notion API).

---

## ✅ Next steps
- Try a first entry: even **one sentence per day** is enough.
- Use “+ One-line quick note” button for super fast capture.
- Regularly export to back up your archive.
