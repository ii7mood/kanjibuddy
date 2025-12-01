# Kanji Buddy

<p align="center">
  <img src="https://8upload.com/image/690f74da70ab9/logo.png" width="400"><br>
</p>

**Kanji Buddy** is a small, self-contained web app for kanji review and lookup.  
It runs entirely offline using a local SQLite database and an Express backend.  
You can add, edit, or review cards directly from the browser — no accounts, no sync, just local data.

---

## 📸 Screenshots

<p align="center">
  <img src="https://8upload.com/image/690f6a5373064/sc1.png" width="600"><br>
  <img src="https://8upload.com/image/690f6a53d1aa8/sc2.png" width="600"><br>
  <img src="https://8upload.com/image/690f6a54369f9/sc3.png" width="600"><br>
  <img src="https://8upload.com/image/690f6a548d159/sc4.png" width="600">
</p>

---

## ⚙️ Requirements

- **Tested on Node.js v25.2.0**  
- **npm** or **pnpm**
- Any modern browser

---

## 🧩 Setup & Usage

```bash
# install dependencies
npm install

# (optional) import your kanji list
node utils/import-ods.js ./path/to/KanjiList.ods/xlsx/etc

# start the local server
node server.js
```

Then open [http://localhost:3000](http://localhost:3000).

All data (review sessions, settings, and database) stays local on your machine.

---

## 🧠 Features

- Review mode with score tracking  
- Kanji database (add/edit/delete)  
- Local session persistence  
- Configurable card count and shuffle  
- Keyboard shortcuts (1–4 for tab switch, Enter to start review, Up/Down to mark right/wrong, C to continue past session)  
- Local config file (`config.json`)

---

## 🧪 Notes

The project uses:
- **Express** for serving static content  
- **Kysely** + **better-sqlite3** for the local database  
- **Vanilla JavaScript** for the frontend, modularized by scene (`review.js`, `lookup.js`, etc.)

---

## 💬 Community

This project is primarily for **personal use**, but if you find it useful or have an idea,  
feel free to open an issue or feature request — I'll *probably* add it.

---

## 🪶 License

MIT License © 2025
