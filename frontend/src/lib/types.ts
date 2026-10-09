export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionOption {
  id: number;
  label: string;
  position: number;
}

export interface Question {
  id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: { max?: number } | null;
  options: QuestionOption[];
}

export interface FormSummary {
  id: number;
  title: string;
  status: "draft" | "published";
  slug: string;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormDetail {
  id: number;
  title: string;
  status: "draft" | "published";
  slug: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface NewQuestion {
  type: QuestionType;
  title?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  settings?: { max?: number };
}

export interface QuestionChanges {
  title?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  settings?: { max?: number };
}

export interface PublicForm {
  title: string;
  slug: string;
  thank_you_message: string;
  questions: Question[];
}

export interface ResponseRow {
  id: number;
  submitted_at: string;
  answers: Record<string, string>;
}

export interface ResponseList {
  total: number;
  responses: ResponseRow[];
}

export interface AnswerDetail {
  question_id: number;
  title: string;
  type: QuestionType;
  value: string | null;
}

export interface ResponseDetail {
  id: number;
  form_id: number;
  submitted_at: string;
  answers: AnswerDetail[];
}

export interface QuestionSummary {
  question_id: number;
  title: string;
  type: QuestionType;
  answered: number;
  skipped: number;
  choices?: { label: string; count: number }[];
  yes?: number;
  no?: number;
  distribution?: { value: number; count: number }[];
  average?: number | null;
  min?: number | null;
  max?: number | null;
  recent?: string[];
}

export interface ResultsSummary {
  form_id: number;
  total_responses: number;
  questions: QuestionSummary[];
}
