# Typeform Clone

A full-stack form builder inspired by Typeform. Creators can build forms, publish a shareable link, collect responses one question at a time, and view results.

**Live demo:** https://typeform-clone-indol-zeta.vercel.app  
**API:** https://typeform-backend-bphh.onrender.com  

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy |
| Database | SQLite |

No login flow — the assignment allows a single default creator. Anyone with the public link can fill a published form.

---

## Project layout

```
backend/
  main.py           # App entry, CORS, startup seed
  models.py         # SQLAlchemy tables
  schemas.py        # Request/response shapes
  seed.py           # Sample forms + responses
  routers/
    forms.py        # CRUD, publish, duplicate
    questions.py    # Question CRUD + reorder
    public.py       # Public form + submit
    results.py      # Responses, summary, CSV export

frontend/
  src/app/          # Pages (workspace, builder, results, public fill)
  src/components/   # UI pieces
  src/lib/          # API client, types, validation
```

---

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On startup the API creates tables and seeds two published forms with sample responses.

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/api/health  

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000  

Optional env (defaults to localhost:8000):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## Database schema

```
users
  id, name, email

forms
  id, owner_id → users
  title, status (draft | published)
  slug (public link code)
  thank_you_message
  created_at, updated_at

questions
  id, form_id → forms
  type, title, description
  required, position
  settings (JSON, e.g. rating max)

question_options
  id, question_id → questions
  label, position

responses
  id, form_id → forms
  submitted_at

answers
  id, response_id → responses
  question_id → questions
  value (stored as text)
```

Deleting a form cascades to its questions, options, responses, and answers.

---

## Question types

short_text · long_text · email · number · yes_no · rating · multiple_choice · dropdown  

Per question: required flag, optional description, and type-specific options/settings.

---

## Main API routes

| Method | Path | What it does |
|--------|------|----------------|
| GET | `/api/forms` | List forms + response counts |
| POST | `/api/forms` | Create form |
| GET | `/api/forms/{id}` | Form detail with questions |
| PATCH | `/api/forms/{id}` | Update title / thank-you |
| DELETE | `/api/forms/{id}` | Delete form |
| POST | `/api/forms/{id}/duplicate` | Clone form + questions |
| POST | `/api/forms/{id}/publish` | Publish |
| POST | `/api/forms/{id}/unpublish` | Unpublish |
| POST | `/api/forms/{id}/questions` | Add question |
| PUT | `/api/forms/{id}/questions/order` | Reorder |
| PATCH | `/api/questions/{id}` | Update question |
| DELETE | `/api/questions/{id}` | Delete question |
| GET | `/api/public/forms/{slug}` | Public form (published only) |
| POST | `/api/public/forms/{slug}/responses` | Submit answers |
| GET | `/api/forms/{id}/responses` | List responses |
| GET | `/api/forms/{id}/summary` | Per-question stats |
| GET | `/api/forms/{id}/responses/export` | CSV export |

Public submits are validated on the server (required fields, email format, numbers, rating range, choice options). Invalid payloads return HTTP 400 with field-level errors.

---

## Features implemented

- **Builder** — add/edit/delete/reorder questions, live preview, all 8 types  
- **Workspace** — list, rename, duplicate, publish/unpublish, copy link, delete  
- **Public fill** — one question at a time, progress, keyboard (Enter), thank-you screen  
- **Results** — response table, single response view, summary stats, CSV export  
- **UX** — toasts, settings placeholders (theme / logic “Coming soon”), dark mode toggle  

Seeded forms on first boot:

1. Customer Feedback Survey (`/f/customer-feedback`)  
2. Event Registration (`/f/event-signup`)  

---

## Design choices

1. **Single default user** — matches the assignment’s simplified auth. All forms belong to `creator@example.com`.
2. **SQLite** — zero-config for local and demo deploys. Schema can move to Postgres via `DATABASE_URL`.
3. **Random slugs** — public links use short unguessable codes, not sequential IDs.
4. **Draft vs published** — only published forms are reachable on `/f/{slug}`.
5. **Answers as text** — stored as strings; type rules enforced on write; analytics parse numbers/ratings when needed.
6. **Server is source of truth** — client validates for UX; backend always re-checks before saving.

---

## Deploy notes

| Service | Role |
|---------|------|
| Vercel | Frontend (`frontend/`), env `NEXT_PUBLIC_API_URL` |
| Render | Backend (`backend/`), start: `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Render env | `ALLOWED_ORIGINS` = your Vercel URL |

Free Render instances sleep when idle; the first request after idle can take ~30–60 seconds.

---

## Assumptions

- One creator is enough for this assignment (no multi-user or roles).  
- Logic jumps, integrations, and team sharing are placeholders only.  
- File upload / payment question types are out of scope.
