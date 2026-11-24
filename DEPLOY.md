# Deploying ScholarSync AI

The app is a single Node.js/Express service that also serves the
frontend (from `public/`), so any Node web host works. Two easy free
options:

## Option A — Render (free web service)

This repository includes a `render.yaml` blueprint, so Render can set
the service up automatically (**New → Blueprint**, connect the repo).
To configure it manually instead:

1. Push this repository to GitHub.
2. On [render.com](https://render.com): **New → Web Service**, connect
   the repo.
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment variables (Render dashboard → Environment):
   - `GEMINI_API_KEY` = your Google AI Studio key (optional — without it,
     explanations use the built-in template fallback)
   - `GEMINI_MODEL` = `gemini-2.0-flash`
   - Render provides `PORT` automatically; the app reads it.
5. Deploy, open the service URL, and test the demo end to end.
   **Test every link in an incognito window before submitting.**

## Option B — Railway

1. On [railway.app](https://railway.app): **New Project → Deploy from
   GitHub repo**, select this repository.
2. Railway detects Node automatically; the start command is
   `npm start` (from `package.json`). Railway provides `$PORT`
   automatically.
3. Add the same environment variables as above under **Variables**.
4. Generate a public domain under **Settings → Networking**.

## Getting a Gemini API key (free)

1. Go to [aistudio.google.com](https://aistudio.google.com) → **Get API key**.
2. Create a key, paste it into the host's environment variables only —
   never commit it to the repository.

## After deploying

- Add the live URL to the README "Demo" section.
- Run through the judge demo script once on the live site:
  profile → results → open one result → show the checks table and the
  AI explanation → show a near match / sorting → download the CSV.

## Note

The Python/FastAPI prototype in `backend/` is kept for reference only;
deployment targets the Node/Express app at the repository root.
