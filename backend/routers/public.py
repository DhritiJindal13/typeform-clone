import math
import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Answer, Form, FormStatus, Question, Response
from schemas import PublicFormOut, ResponseCreate, ResponseCreated

router = APIRouter(prefix="/api/public", tags=["public"])

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_SHORT_TEXT = 500
MAX_LONG_TEXT = 5000


def get_published_form_or_404(db: Session, slug: str) -> Form:
    form = db.query(Form).filter(Form.slug == slug).first()
    if not form or form.status != FormStatus.PUBLISHED.value:
        raise HTTPException(status_code=404, detail="This form is not available")
    return form


def check_answer(question: Question, value: str) -> str | None:
    kind = question.type

    if kind == "short_text" and len(value) > MAX_SHORT_TEXT:
        return f"Please keep this under {MAX_SHORT_TEXT} characters"
    if kind == "long_text" and len(value) > MAX_LONG_TEXT:
        return f"Please keep this under {MAX_LONG_TEXT} characters"

    if kind == "email" and not EMAIL_PATTERN.match(value):
        return "Please enter a valid email address"

    if kind == "number":
        try:
            number = float(value)
        except ValueError:
            return "Please enter a number"
        if not math.isfinite(number):
            return "Please enter a number"

    if kind == "yes_no" and value not in ("yes", "no"):
        return "Please choose Yes or No"

    if kind == "rating":
        max_stars = (question.settings or {}).get("max", 5)
        if not value.isdigit() or not 1 <= int(value) <= max_stars:
            return f"Please choose a rating from 1 to {max_stars}"

    if kind in ("multiple_choice", "dropdown"):
        if value not in [option.label for option in question.options]:
            return "Please choose one of the options"

    return None


@router.get("/forms/{slug}", response_model=PublicFormOut)
def open_public_form(slug: str, db: Session = Depends(get_db)):
    return get_published_form_or_404(db, slug)


@router.post("/forms/{slug}/responses", response_model=ResponseCreated, status_code=201)
def submit_response(slug: str, body: ResponseCreate, db: Session = Depends(get_db)):
    form = get_published_form_or_404(db, slug)
    questions_by_id = {q.id: q for q in form.questions}

    submitted: dict[int, str] = {}
    for answer in body.answers:
        if answer.question_id not in questions_by_id:
            raise HTTPException(
                status_code=400,
                detail="An answer belongs to a question that is not in this form",
            )
        if answer.question_id in submitted:
            raise HTTPException(
                status_code=400,
                detail="The same question was answered twice",
            )
        submitted[answer.question_id] = answer.value.strip()

    errors: dict[str, str] = {}
    for question in form.questions:
        value = submitted.get(question.id, "")
        if value == "":
            if question.required:
                errors[str(question.id)] = "This question is required"
            continue
        message = check_answer(question, value)
        if message:
            errors[str(question.id)] = message

    if errors:
        return JSONResponse(
            status_code=400,
            content={"detail": "Please fix the highlighted answers", "errors": errors},
        )

    response = Response(
        form_id=form.id,
        answers=[
            Answer(question_id=question_id, value=value)
            for question_id, value in submitted.items()
            if value != ""
        ],
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return ResponseCreated(id=response.id, thank_you_message=form.thank_you_message)
