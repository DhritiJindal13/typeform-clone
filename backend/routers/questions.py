from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Form, FormStatus, Question, QuestionOption, utcnow
from schemas import QuestionCreate, QuestionOrder, QuestionOut, QuestionUpdate

router = APIRouter(tags=["questions"])

CHOICE_TYPES = {"multiple_choice", "dropdown"}
MAX_OPTIONS = 50


def get_form_or_404(db: Session, form_id: int) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


def get_question_or_404(db: Session, question_id: int) -> Question:
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


def touch_form(form: Form) -> None:
    """Mark the form as 'just edited' so it moves to the top of the list."""
    form.updated_at = utcnow()


def clean_options(labels: list[str]) -> list[str]:
    """Remove empty choices and check the number of choices is sensible."""
    cleaned = [label.strip() for label in labels if label.strip()]
    if not cleaned:
        raise HTTPException(status_code=400, detail="Add at least one choice")
    if len(cleaned) > MAX_OPTIONS:
        raise HTTPException(
            status_code=400, detail=f"A question can have at most {MAX_OPTIONS} choices"
        )
    return cleaned


def clean_settings(question_type: str, settings: dict | None) -> dict | None:
    """Only rating questions have a setting: how many stars (1 to 10)."""
    if question_type != "rating":
        return None
    max_stars = (settings or {}).get("max", 5)
    if isinstance(max_stars, bool) or not isinstance(max_stars, int) or not 1 <= max_stars <= 10:
        raise HTTPException(status_code=400, detail="Rating size must be a whole number from 1 to 10")
    return {"max": max_stars}


@router.post("/api/forms/{form_id}/questions", response_model=QuestionOut, status_code=201)
def create_question(form_id: int, body: QuestionCreate, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)

    if body.type in CHOICE_TYPES:
        labels = clean_options(body.options) if body.options is not None else ["Option 1", "Option 2"]
    else:
        if body.options:
            raise HTTPException(status_code=400, detail="Only choice questions can have choices")
        labels = []

    last_position = db.query(func.max(Question.position)).filter(Question.form_id == form.id).scalar()
    next_position = 0 if last_position is None else last_position + 1

    question = Question(
        form_id=form.id,
        type=body.type,
        title=body.title or "Untitled question",
        description=body.description or None,
        required=body.required,
        position=next_position,
        settings=clean_settings(body.type, body.settings),
        options=[QuestionOption(label=label, position=i) for i, label in enumerate(labels)],
    )
    db.add(question)
    touch_form(form)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/api/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: int, body: QuestionUpdate, db: Session = Depends(get_db)):
    question = get_question_or_404(db, question_id)
    data = body.model_dump(exclude_unset=True)

    if data.get("title") is not None:
        question.title = data["title"]
    if "description" in data:
        question.description = data["description"] or None
    if data.get("required") is not None:
        question.required = data["required"]
    if data.get("options") is not None:
        if question.type not in CHOICE_TYPES:
            raise HTTPException(status_code=400, detail="Only choice questions can have choices")
        labels = clean_options(data["options"])
        question.options = [QuestionOption(label=label, position=i) for i, label in enumerate(labels)]
    if "settings" in data:
        question.settings = clean_settings(question.type, data["settings"])

    touch_form(question.form)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/api/questions/{question_id}", status_code=204)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = get_question_or_404(db, question_id)
    form = question.form
    db.delete(question)
    db.flush()

    remaining = (
        db.query(Question)
        .filter(Question.form_id == form.id)
        .order_by(Question.position)
        .all()
    )
    for index, q in enumerate(remaining):
        q.position = index

    if not remaining and form.status == FormStatus.PUBLISHED.value:
        form.status = FormStatus.DRAFT.value

    touch_form(form)
    db.commit()


@router.put("/api/forms/{form_id}/questions/order", response_model=list[QuestionOut])
def reorder_questions(form_id: int, body: QuestionOrder, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    questions = db.query(Question).filter(Question.form_id == form.id).all()
    by_id = {q.id: q for q in questions}

    if len(body.question_ids) != len(set(body.question_ids)) or set(body.question_ids) != set(by_id):
        raise HTTPException(
            status_code=400,
            detail="The list must contain every question of this form exactly once",
        )

    for index, question_id in enumerate(body.question_ids):
        by_id[question_id].position = index

    touch_form(form)
    db.commit()
    return sorted(questions, key=lambda q: q.position)
