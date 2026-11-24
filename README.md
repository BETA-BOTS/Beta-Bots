# ScholarSync AI — Scholarship Finder

ScholarSync AI helps students stop missing scholarships. A student enters
their **CGPA**, **department**, and whether they **need financial support**;
the app checks every scholarship in the organizer-provided dataset with
**deterministic rules** and uses AI only to *explain* — in plain language —
why each scholarship matches, what is missing for near matches, and what
could not be verified.

**Eligibility is always decided by code, never by an LLM.** If the AI
service is unavailable, the app still returns full results with safe
template-based explanations.

## Track

**Track 3 — Personalized Learning & Productivity (Scholarship Finder)**
Beginner AI Hackathon 2026 · PCIU Computer Club

## Team

**Team name:** [TEAM NAME]

| Member | Role |
|---|---|
| [Member Name] | [Role — e.g. Team Leader / Backend] |
| [Member Name] | [Role — e.g. Frontend] |
| [Member Name] | [Role — e.g. Data & Testing] |

## Features

- Profile form: CGPA (out of 4.00, the scale used by the dataset),
  department (populated from the dataset), financial-support need, and
  gender (needed because the dataset contains gender-restricted
  scholarships; "Prefer not to say" sends those records to *Needs review*
  instead of silently passing them).
- Deterministic matching on CGPA, department, financial need and gender,
  with criterion-by-criterion Pass / Fail / Not specified evidence.
- Results as cards with counts (eligible, near matches, needs review,
  records checked), sorting by deadline or amount (missing values last).
- Near matches show the exact measurable gap (e.g. "CGPA 0.20 below the
  minimum 3.50").
- Detail view with all source fields, the checks table, the AI
  explanation shown separately, and an application checklist (generic
  preparation checklist, clearly labelled — the dataset contains no
  official application steps).
- Download results as CSV. Bangla (বাংলা) interface toggle.
- Honest empty state: "No matching scholarships found in the provided
  list." Nothing is ever invented; missing data is shown as
  "Not provided in the scholarship data".

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, Express |
| Frontend | Static HTML/CSS/JavaScript served by Express from `public/` (no build step, no CDN dependencies) |
| Data | Organizer-provided CSV (`data/scholarships.csv`, 136 records), loaded in memory at startup with `csv-parse` |
| AI | Google Gemini API (explanations only, behind a service wrapper) with a deterministic template fallback |
| Tests | Node's built-in `node:test` runner |

> An earlier Python/FastAPI prototype of the same app is kept in
> `backend/` for reference. The Node/Express app at the repository root
> is the main, deployed application; both implement identical matching
> behaviour against the same dataset.

## Setup and run

```bash
npm install

# Optional: enable AI explanations (the app works without a key)
cp .env.example .env             # then put your key in .env
export GEMINI_API_KEY=<your-key> # or set it in your shell / host settings

npm start
```

Open **http://localhost:8000** in a browser.

Run the tests:

```bash
npm test
```

## API

| Method & route | Purpose |
|---|---|
| `GET /api/health` | Service status and loaded record count |
| `GET /api/meta` | Departments, CGPA scale guidance, dataset status |
| `POST /api/match` | Body: `cgpa`, `department`, `financial_support_needed`, `gender`, `lang`, `sort_by` → eligible / near_matches / needs_review + counts |
| `GET /api/scholarships/{id}` | Full source record; pass profile query params to also get criterion checks and an explanation |
| `POST /api/export` | Body: `{results: [...]}` → downloadable CSV of the displayed results |

## AI tools and API disclosure

- **Muse (Meta AI coding assistant)** was used to help design and write
  this codebase during the hackathon build window. All team members can
  explain the code, as required by the rulebook.
- **Google Gemini API** (`GEMINI_MODEL`, default `gemini-2.0-flash`) is
  called by the backend explanation service to turn *already-verified*
  eligibility results into short explanations. It receives only the
  student profile, the scholarship record and the code-computed checks;
  it is instructed not to invent facts and cannot change any status.
  Without a key (or on any API failure) the app uses deterministic
  template explanations built from the same checks.
- No other external APIs are used. No API keys are committed to this
  repository; keys are read from environment variables (see
  `backend/.env.example`).

## Attributions

- Scholarship dataset (`track3_scholarships`): provided by the
  **PCIU Computer Club** hackathon organizers for Track 3. All
  scholarship names, amounts, deadlines and rules shown in the app come
  from that file, unmodified.
- Icons/emoji in the UI are standard Unicode characters; no third-party
  logos or endorsements are used.

## Demo

- Live demo: [DEMO LINK — add after deployment, see DEPLOY.md]
- Demo video: [VIDEO LINK — optional]

## Disclaimer

Results are based solely on the supplied scholarship dataset and are not
a guarantee of any award. Students should verify official details,
deadlines and application procedures with each provider.
