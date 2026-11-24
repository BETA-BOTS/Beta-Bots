# Deploying ScholarSync AI

The app is a single FastAPI service that also serves the frontend, so
any Python web host works. Two easy free options:

## Option A — Render (free web service)

1. Push this repository to GitHub.
2. On [render.com](https://render.com): **New → Web Service**, connect
   the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables (Render dashboard → Environment):
   - `GEMINI_API_KEY` = your Google AI Studio key (optional — without it,
     explanations use the built-in template fallback)
   - `GEMINI_MODEL` = `gemini-2.0-flash`
5. Deploy, open the service URL, and test the demo end to end.
   **Test every link in an incognito window before submitting.**

## Option B — Railway

1. On [railway.app](https://railway.app): **New Project → Deploy from
   GitHub repo**, select this repository.
2. Set the service **Root Directory** to `backend` and the start command
   to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   (Railway provides `$PORT` automatically).
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
