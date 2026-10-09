from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class OptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    label: str
    position: int


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    title: str
    description: Optional[str]
    required: bool
    position: int
    settings: Optional[dict]
    options: list[OptionOut]


class FormCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(default="Untitled form", min_length=1, max_length=200)


class FormUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    thank_you_message: Optional[str] = Field(default=None, max_length=2000)


class FormSummary(BaseModel):
    id: int
    title: str
    status: str
    slug: str
    response_count: int
    created_at: datetime
    updated_at: datetime


class FormDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    status: str
    slug: str
    thank_you_message: str
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionOut]


QuestionTypeName = Literal[
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
]


class QuestionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    type: QuestionTypeName
    title: str = Field(default="", max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    required: bool = False
    options: Optional[list[str]] = None
    settings: Optional[dict] = None


class QuestionUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    required: Optional[bool] = None
    options: Optional[list[str]] = None
    settings: Optional[dict] = None


class QuestionOrder(BaseModel):
    question_ids: list[int]


class PublicFormOut(BaseModel):
    """What a respondent sees: no owner info, no internal status."""
    model_config = ConfigDict(from_attributes=True)
    title: str
    slug: str
    thank_you_message: str
    questions: list[QuestionOut]


class AnswerIn(BaseModel):
    question_id: int
    value: str = Field(max_length=10000)


class ResponseCreate(BaseModel):
    answers: list[AnswerIn]


class ResponseCreated(BaseModel):
    id: int
    thank_you_message: str


class ResponseRow(BaseModel):
    """One line of the responses table. Answers are keyed by question id."""
    id: int
    submitted_at: datetime
    answers: dict[str, str]


class ResponseListOut(BaseModel):
    total: int
    responses: list[ResponseRow]


class AnswerDetail(BaseModel):
    question_id: int
    title: str
    type: str
    value: Optional[str]


class ResponseDetail(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    answers: list[AnswerDetail]
