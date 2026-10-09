import type { QuestionType } from "./types";

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  icon: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { type: "short_text", label: "Short text", icon: "Aa" },
  { type: "long_text", label: "Long text", icon: "Ab" },
  { type: "multiple_choice", label: "Multiple choice", icon: "A." },
  { type: "dropdown", label: "Dropdown", icon: "v" },
  { type: "email", label: "Email", icon: "@" },
  { type: "number", label: "Number", icon: "#" },
  { type: "yes_no", label: "Yes / No", icon: "Y/N" },
  { type: "rating", label: "Rating", icon: "*" },
];

export function getQuestionType(type: QuestionType): QuestionTypeInfo {
  return QUESTION_TYPES.find((item) => item.type === type) ?? QUESTION_TYPES[0];
}
