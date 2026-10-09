import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Form, FormStatus, Question, QuestionOption, Response, User
from schemas import FormCreate, FormDetail, FormSummary, FormUpdate

router = APIRouter(prefix="/api/forms", tags=["forms"])

DEFAULT_USER_EMAIL = "creator@example.com"


def get_default_user(db: Session) -> User:
    """No login in this project, so everyone is the same 'default creator'."""
    user = db.query(User).filter(User.email == DEFAULT_USER_EMAIL).first()
    if not user:
        user = User(name="Default Creator", email=DEFAULT_USER_EMAIL)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def make_unique_slug(db: Session) -> str:
    """A short random code for the public link, e.g. 'k3J9xQ2a'."""
    while True:
        slug = secrets.token_urlsafe(6)
        if not db.query(Form).filter(Form.slug == slug).first():
            return slug


def get_form_or_404(db: Session, form_id: int) -> Form:
    form = db.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


def build_summary(form: Form, response_count: int) -> FormSummary:
    return FormSummary(
        id=form.id,
        title=form.title,
        status=form.status,
        slug=form.slug,
        response_count=response_count,
        created_at=form.created_at,
        updated_at=form.updated_at,
    )


@router.post("", response_model=FormDetail, status_code=201)
def create_form(body: FormCreate, db: Session = Depends(get_db)):
    user = get_default_user(db)
    form = Form(owner_id=user.id, title=body.title, slug=make_unique_slug(db))
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("", response_model=list[FormSummary])
def list_forms(db: Session = Depends(get_db)):
    user = get_default_user(db)
    # For each form, count how many responses it has. Newest edited first.
    rows = (
        db.query(Form, func.count(Response.id))
        .outerjoin(Response, Response.form_id == Form.id)
        .filter(Form.owner_id == user.id)
        .group_by(Form.id)
        .order_by(Form.updated_at.desc())
        .all()
    )
    return [build_summary(form, count) for form, count in rows]


@router.get("/{form_id}", response_model=FormDetail)
def get_form(form_id: int, db: Session = Depends(get_db)):
    return get_form_or_404(db, form_id)


@router.patch("/{form_id}", response_model=FormDetail)
def update_form(form_id: int, body: FormUpdate, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    # Only change the fields that were actually sent
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(form, field, value)
    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", status_code=204)
def delete_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    db.delete(form)  # questions, options and responses are deleted with it
    db.commit()


@router.post("/{form_id}/duplicate", response_model=FormDetail, status_code=201)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    original = get_form_or_404(db, form_id)
    copy = Form(
        owner_id=original.owner_id,
        title=f"{original.title} (copy)"[:200],
        slug=make_unique_slug(db),
        thank_you_message=original.thank_you_message,
    )
    # Copy every question, with its choices. Responses are NOT copied.
    for q in original.questions:
        copy.questions.append(
            Question(
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                position=q.position,
                settings=q.settings,
                options=[
                    QuestionOption(label=o.label, position=o.position)
                    for o in q.options
                ],
            )
        )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy


@router.post("/{form_id}/publish", response_model=FormDetail)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    if not form.questions:
        raise HTTPException(
            status_code=400, detail="Add at least one question before publishing"
        )
    form.status = FormStatus.PUBLISHED.value
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/unpublish", response_model=FormDetail)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_or_404(db, form_id)
    form.status = FormStatus.DRAFT.value
    db.commit()
    db.refresh(form)
    return form
