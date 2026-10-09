import csv
import io
from collections import Counter, defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Answer, Form, Question, Response
from schemas import AnswerDetail, ResponseDetail, ResponseListOut, ResponseRow

router = APIRouter(tags=["results"])

RECENT_TEXT_ANSWERS = 5


def get_form_or_404(db: Session, form_id: int) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.get("/api/forms/{form_id}/responses", response_model=ResponseListOut)
def list_responses(
    form_id: int,
    limit: int = Query(default=100, ge=1, le=500),  # how many to return
    offset: int = Query(default=0, ge=0),  # how many to skip (for page 2, 3...)
    db: Session = Depends(get_db),
):
    form = get_form_or_404(db, form_id)
    total = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar()

    rows = (
        db.query(Response)
        .options(selectinload(Response.answers))  # fetch all answers in one go
        .filter(Response.form_id == form.id)
        .order_by(Response.submitted_at.desc(), Response.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return ResponseListOut(
        total=total,
        responses=[
            ResponseRow(
                id=r.id,
                submitted_at=r.submitted_at,
                answers={str(a.question_id): a.value for a in r.answers},
            )
            for r in rows
        ],
    )


@router.get("/api/responses/{response_id}", response_model=ResponseDetail)
def get_response(response_id: int, db: Session = Depends(get_db)):
    response = db.get(Response, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    given = {a.question_id: a.value for a in response.answers}
    # Walk through the form's questions in order, so skipped ones still appear
    return ResponseDetail(
        id=response.id,
        form_id=response.form_id,
        submitted_at=response.submitted_at,
        answers=[
            AnswerDetail(
                question_id=q.id,
                title=q.title,
                type=q.type,
                value=given.get(q.id),
            )
            for q in response.form.questions
        ],
    )


@router.delete("/api/responses/{response_id}", status_code=204)
def delete_response(response_id: int, db: Session = Depends(get_db)):
    response = db.get(Response, response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    db.delete(response)
    db.commit()


def summarise_question(question: Question, values: list[str], total: int) -> dict:
    """Build the simple counts for one question."""
    summary = {
        "question_id": question.id,
        "title": question.title,
        "type": question.type,
        "answered": len(values),
        "skipped": total - len(values),
    }

    if question.type in ("multiple_choice", "dropdown"):
        counts = Counter(values)
        choices = [{"label": o.label, "count": counts.pop(o.label, 0)} for o in question.options]
        # Answers for choices that were renamed or removed later still get counted
        choices += [{"label": label, "count": count} for label, count in counts.items()]
        summary["choices"] = choices

    elif question.type == "yes_no":
        counts = Counter(values)
        summary["yes"] = counts.get("yes", 0)
        summary["no"] = counts.get("no", 0)

    elif question.type == "rating":
        max_stars = (question.settings or {}).get("max", 5)
        counts = Counter(int(v) for v in values if v.isdigit())
        summary["distribution"] = [{"value": n, "count": counts.get(n, 0)} for n in range(1, max_stars + 1)]
        summary["average"] = round(sum(n * c for n, c in counts.items()) / len(values), 2) if values else None

    elif question.type == "number":
        numbers = []
        for v in values:
            try:
                numbers.append(float(v))
            except ValueError:
                pass  # ignore anything that is not a number
        summary["average"] = round(sum(numbers) / len(numbers), 2) if numbers else None
        summary["min"] = min(numbers) if numbers else None
        summary["max"] = max(numbers) if numbers else None

    else:  # short_text, long_text, email
        summary["recent"] = list(reversed(values[-RECENT_TEXT_ANSWERS:]))

    return summary


@router.get("/api/forms/{form_id}/summary")
def get_summary(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    total = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar()

    # One query for all answers of this form, then group them by question
    rows = (
        db.query(Answer.question_id, Answer.value)
        .join(Response, Answer.response_id == Response.id)
        .filter(Response.form_id == form.id)
        .order_by(Answer.id)
        .all()
    )
    values_by_question = defaultdict(list)
    for question_id, value in rows:
        values_by_question[question_id].append(value)

    return {
        "form_id": form.id,
        "total_responses": total,
        "questions": [
            summarise_question(q, values_by_question[q.id], total) for q in form.questions
        ],
    }


FORMULA_PREFIXES = ("=", "+", "-", "@")


def csv_safe(value: str, question_type: str) -> str:
    if question_type != "number" and value.startswith(FORMULA_PREFIXES):
        return "'" + value
    return value


@router.get("/api/forms/{form_id}/responses/export")
def export_responses(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    responses = (
        db.query(Response)
        .options(selectinload(Response.answers))
        .filter(Response.form_id == form.id)
        .order_by(Response.submitted_at, Response.id)
        .all()
    )

    buffer = io.StringIO()
    buffer.write("\ufeff")
    writer = csv.writer(buffer)
    writer.writerow(
        ["Response ID", "Submitted at (UTC)"] + [csv_safe(q.title, "text") for q in form.questions]
    )
    for response in responses:
        given = {a.question_id: a.value for a in response.answers}
        writer.writerow(
            [response.id, response.submitted_at.isoformat(sep=" ", timespec="seconds")]
            + [csv_safe(given.get(q.id, ""), q.type) for q in form.questions]
        )

    filename = f"{form.slug}-responses.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
