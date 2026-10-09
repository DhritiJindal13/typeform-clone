from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401  (importing this makes the tables known)
from routers import forms, public, questions, results

app = FastAPI(title="Typeform Clone API")

# Creates any tables that don't exist yet.
Base.metadata.create_all(bind=engine)

# Lets our frontend (port 3000) talk to this backend (port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(results.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
