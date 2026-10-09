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
