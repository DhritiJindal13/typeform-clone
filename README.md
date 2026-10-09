# Typeform Clone

A full-stack clone of Typeform. Creators build forms with a drag-and-drop builder, publish them as a shareable link, and collect answers through the one-question-at-a-time experience. Responses are shown in a results page with a table and per-question summary stats.

- **Live demo:** https://typeform-clone-indol-zeta.vercel.app
- **API (Swagger docs):** https://typeform-backend-bphh.onrender.com/docs
- **Repository:** https://github.com/DhritiJindal13/typeform-clone

## Features

**Form builder**
- Create a form with a title and an ordered list of questions
- Add, edit, delete and drag-and-drop reorder questions
- 8 question types: short text, long text, multiple choice, dropdown, email, number, yes/no, rating
- Per-question settings: required toggle, description text, choices, rating size
- Live three-panel layout: question list, live preview, settings panel
- Full-screen preview of the form from inside the builder (runs the real fill experience without saving anything)
- Form settings window: editable thank-you message, plus "Coming soon" cards for Theme, Logic jumps, Integrations and Sharing & collaboration
- Inline title editing, confirmation dialogs and toast notifications

**Form management**
- Dashboard listing every form with its status (draft or published) and response count
- Create, rename, duplicate, delete
- Publish and unpublish, with a shareable public link
- Everything is stored in the database

**Respondent flow (no login needed)**
- One question at a time, full screen, with slide transitions
- Keyboard navigation: Enter or the down arrow to continue, the up arrow to go back, letter keys for choices, Y/N for yes/no, number keys for ratings
- Progress bar
- Validation in the browser and again on the server (required, email format, number, choice must be a real option, rating range)
- Thank-you screen after submitting

**Results**
- Responses table, newest first
- Single response view in a side panel, with delete
- Summary stats per question: counts for choice and yes/no questions, average and distribution for ratings, average/min/max for numbers, latest answers for text

**Extras**
- Dark mode (the choice is remembered in the browser)
- CSV export of responses, with protection against spreadsheet formula injection
- Seed data: two published forms with mixed question types and existing responses

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Drag and drop | dnd-kit |
| Backend | Python, FastAPI, Pydantic |
| ORM | SQLAlchemy |
| Database | SQLite |

## Project structure

```
typeform-clone/
  backend/
    main.py            app setup, CORS, routers, startup
    database.py        database connection and session
    models.py          database tables
    schemas.py         request and response shapes (Pydantic)
    seed.py            sample forms and responses
    routers/
      forms.py         form CRUD, duplicate, publish
      questions.py     question CRUD and reorder
      public.py        public form view and submit
      results.py       responses list, single response, summary
  frontend/
    src/
      app/             pages: dashboard, builder, fill page, results
      components/      builder, respondent and results components
      lib/             API client, types, validation, formatting
```

## Getting started

You need Python 3.9 or newer and Node 18 or newer.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`, and the interactive docs are at `http://localhost:8000/docs`. The database file `typeform.db` is created automatically. Sample data is added on startup, and you can also run it by hand with `python seed.py` (it skips anything that already exists).

### Frontend

```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm run dev
```

Open `http://localhost:3000`.

### Try the seeded forms

| Form | Public link |
|---|---|
| Customer Feedback Survey | `/f/customer-feedback` |
| Event Registration | `/f/event-signup` |

## Architecture

```
Browser (Next.js)  --->  FastAPI  --->  SQLAlchemy  --->  SQLite
```

- The **frontend** never talks to the database. Every call goes through one file, `src/lib/api.ts`, which turns server errors into readable messages.
- The **backend** is split by job: routers hold the endpoints, `schemas.py` guards what comes in and goes out, `models.py` describes the tables.
- The **creator** is a single default user, because real login is out of scope. The `owner_id` column is already in place, so adding login later does not change the schema.
- The **public fill page** needs no login and only works for published forms.
- Settings that change between local and deployed are read from environment variables: `NEXT_PUBLIC_API_URL` (frontend, the backend address), `ALLOWED_ORIGINS` (backend, comma-separated frontend addresses allowed through CORS) and `DATABASE_URL` (backend, optional, defaults to a local SQLite file).

## Database schema

```
users --< forms --< questions --< question_options
            |            |
            +--< responses --< answers >-- questions
```

| Table | Purpose | Main columns |
|---|---|---|
| `users` | The default creator | id, name, email (unique) |
| `forms` | A form and its settings | id, owner_id, title, status (`draft` / `published`), slug (unique), thank_you_message, created_at, updated_at |
| `questions` | Ordered questions of a form | id, form_id, type, title, description, required, position, settings (JSON) |
| `question_options` | Choices for multiple choice and dropdown | id, question_id, label, position |
| `responses` | One submission of a form | id, form_id, submitted_at |
| `answers` | One answer to one question in a submission | id, response_id, question_id, value |

Design notes:
- All foreign keys use `ON DELETE CASCADE`, so deleting a form removes its questions, choices, responses and answers. SQLite does not enforce foreign keys by default, so they are switched on for every connection.
- Questions are ordered with an integer `position`. Reordering means saving new position numbers.
- Choices have their own table instead of a JSON list, so they are real rows that can be queried.
- `answers.value` is text for every question type, so one column fits all types and old answers still make sense if a choice is renamed later. A unique constraint on (response_id, question_id) stops duplicate answers.
- `forms.slug` is a random code, not the form id, so public links cannot be guessed by counting.
- Indexes: `forms.slug` (unique), `questions(form_id, position)`, `responses.form_id`, `answers.response_id`, `answers.question_id`, `question_options.question_id`.

## API overview

All routes start with `/api`. Full interactive documentation is at `/docs`.

**Forms**

| Method | Path | What it does |
|---|---|---|
| GET | `/api/forms` | List forms with status and response count |
| POST | `/api/forms` | Create a form |
| GET | `/api/forms/{id}` | Get a form with its questions |
| PATCH | `/api/forms/{id}` | Rename or change the thank-you message |
| DELETE | `/api/forms/{id}` | Delete a form and everything inside it |
| POST | `/api/forms/{id}/duplicate` | Copy a form with its questions |
| POST | `/api/forms/{id}/publish` | Publish (needs at least one question) |
| POST | `/api/forms/{id}/unpublish` | Back to draft |

**Questions**

| Method | Path | What it does |
|---|---|---|
| POST | `/api/forms/{id}/questions` | Add a question at the end |
| PATCH | `/api/questions/{id}` | Edit title, description, required, choices, rating size |
| DELETE | `/api/questions/{id}` | Delete a question and renumber the rest |
| PUT | `/api/forms/{id}/questions/order` | Save a new order (the list must contain every question once) |

**Public (no login)**

| Method | Path | What it does |
|---|---|---|
| GET | `/api/public/forms/{slug}` | Open a published form |
| POST | `/api/public/forms/{slug}/responses` | Submit answers (validated, all-or-nothing) |

**Results**

| Method | Path | What it does |
|---|---|---|
| GET | `/api/forms/{id}/responses` | List responses (supports `limit` and `offset`) |
| GET | `/api/responses/{id}` | One response in full |
| DELETE | `/api/responses/{id}` | Delete one response |
| GET | `/api/forms/{id}/summary` | Per-question stats |
| GET | `/api/forms/{id}/responses/export` | Download all responses as a CSV file |

**Other**

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | Health check |

### Validation rules (server side)

| Question type | Rule |
|---|---|
| Any | Required questions cannot be empty |
| Short text | Up to 500 characters |
| Long text | Up to 5000 characters |
| Email | Must look like `name@site.com` |
| Number | Must be a real number |
| Yes/No | Must be `yes` or `no` |
| Rating | Whole number from 1 to the question's rating size |
| Multiple choice, dropdown | Must be one of the question's choices |

If any answer is invalid, nothing is saved, and the reply lists every problem at once, keyed by question id.

## Assumptions and trade-offs

- There is one default creator. Login and team features are out of scope.
- Draft forms return "not available" on the public link, the same as a form that does not exist.
- The summary is calculated when requested instead of stored, so it is always correct. This is fine at this size, and would need caching for very large forms.
- Tables are created with `create_all` instead of migrations, for simplicity.
- SQLite is used because the assignment requires it. On hosts with temporary disks, the database can reset on restart, which is why the sample data is re-added on startup. Forms created on the live demo may disappear after a restart.
- Because there is no login, anyone with the demo link can edit or delete forms. This is the assumption the assignment allows (a default logged-in creator).
- The free backend host goes to sleep when idle, so the first request after a break can take up to a minute.
- The responses table loads the 100 newest responses; the total count and the summary always include every response.

## Not implemented

Logic jumps and branching, integrations and webhooks, team collaboration, and file-upload and payment question types.

## Deployment

- Frontend: Vercel, with `NEXT_PUBLIC_API_URL` set to the backend address
- Backend: Render, with `ALLOWED_ORIGINS` set to the Vercel address
