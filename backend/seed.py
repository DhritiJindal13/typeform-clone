import random
from datetime import timedelta

from database import Base, SessionLocal, engine
from models import Answer, Form, FormStatus, Question, QuestionOption, Response, utcnow
from routers.forms import get_default_user

random.seed(7)

NAMES = [
    "Aarav", "Diya", "Kabir", "Meera", "Rohan", "Ananya", "Vikram", "Isha",
    "Arjun", "Sara", "Neha", "Karan", "Tanya", "Dev", "Priya", "Yash",
    "Riya", "Manav",
]
COMMENTS = [
    "Really smooth experience, thank you!",
    "Loved it. Would be great to have a dark mode.",
    "Support replied quickly and solved my issue.",
    "Setup took a bit long, but everything works well now.",
    "Please add more ways to export my data.",
    "Great value for the price.",
]

FEEDBACK_QUESTIONS = [
    {"type": "short_text", "title": "What's your name?", "required": True},
    {"type": "email", "title": "What's your email address?", "required": True,
     "description": "We'll only use it to follow up on your feedback."},
    {"type": "multiple_choice", "title": "How did you hear about us?",
     "options": ["A friend", "Social media", "Search engine", "Other"]},
    {"type": "rating", "title": "How would you rate our service?", "required": True,
     "settings": {"max": 5}},
    {"type": "yes_no", "title": "Would you recommend us to a friend?", "required": True},
    {"type": "dropdown", "title": "Which product do you use the most?",
     "options": ["Mobile app", "Website", "Desktop app"]},
    {"type": "number", "title": "How many times did you use us this month?"},
    {"type": "long_text", "title": "Anything else you'd like to tell us?",
     "description": "Optional, but we read every message."},
]

EVENT_QUESTIONS = [
    {"type": "short_text", "title": "Your full name", "required": True},
    {"type": "email", "title": "Your email address", "required": True},
    {"type": "dropdown", "title": "Which session will you attend?", "required": True,
     "options": ["Morning workshop", "Afternoon talk", "Evening networking"]},
    {"type": "multiple_choice", "title": "What's your T-shirt size?",
     "options": ["S", "M", "L", "XL"]},
    {"type": "number", "title": "How many guests are you bringing?"},
    {"type": "yes_no", "title": "Do you need vegetarian food?"},
    {"type": "rating", "title": "How excited are you about the event?",
     "settings": {"max": 5}},
    {"type": "long_text", "title": "Any questions for the speakers?"},
]


def fake_answer(question: Question, name: str) -> str:
    kind = question.type
    if kind == "short_text":
        return name
    if kind == "email":
        return f"{name.lower()}{random.randint(1, 99)}@example.com"
    if kind in ("multiple_choice", "dropdown"):
        return random.choice(question.options).label
    if kind == "yes_no":
        return random.choice(["yes", "yes", "no"])
    if kind == "rating":
        return str(random.choice([2, 3, 4, 4, 5, 5, 5]))
    if kind == "number":
        return str(random.randint(1, 12))
    return random.choice(COMMENTS)


def create_form(db, owner, slug, title, thank_you, question_specs, response_count):
    if db.query(Form).filter(Form.slug == slug).first():
        print(f"Skipped '{title}' (already exists)")
        return

    form = Form(
        owner_id=owner.id,
        title=title,
        slug=slug,
        status=FormStatus.PUBLISHED.value,
        thank_you_message=thank_you,
    )
    for position, spec in enumerate(question_specs):
        form.questions.append(
            Question(
                type=spec["type"],
                title=spec["title"],
                description=spec.get("description"),
                required=spec.get("required", False),
                position=position,
                settings=spec.get("settings"),
                options=[
                    QuestionOption(label=label, position=i)
                    for i, label in enumerate(spec.get("options", []))
                ],
            )
        )
    db.add(form)
    db.flush()

    for i in range(response_count):
        name = NAMES[i % len(NAMES)]
        answers = []
        for question in form.questions:
            if not question.required and random.random() < 0.3:
                continue
            answers.append(Answer(question_id=question.id, value=fake_answer(question, name)))
        when = utcnow() - timedelta(days=random.randint(0, 13), hours=random.randint(0, 23))
        db.add(Response(form_id=form.id, submitted_at=when, answers=answers))

    print(f"Created '{title}' with {response_count} responses")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        owner = get_default_user(db)
        create_form(
            db, owner, "customer-feedback", "Customer Feedback Survey",
            "Thank you! Your feedback helps us improve.", FEEDBACK_QUESTIONS, 18,
        )
        create_form(
            db, owner, "event-signup", "Event Registration",
            "You're registered! See you at the event.", EVENT_QUESTIONS, 12,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
