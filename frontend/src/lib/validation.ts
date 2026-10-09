import type { Question } from "./types";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NUMBER_PATTERN = /^-?\d*\.?\d+$/;

export function validateAnswer(question: Question, rawValue: string): string | null {
  const value = rawValue.trim();

  if (value === "") {
    return question.required ? "This question is required" : null;
  }

  switch (question.type) {
    case "short_text":
      return value.length > 500 ? "Please keep this under 500 characters" : null;

    case "long_text":
      return value.length > 5000 ? "Please keep this under 5000 characters" : null;

    case "email":
      return EMAIL_PATTERN.test(value) ? null : "Please enter a valid email address";

    case "number":
      return NUMBER_PATTERN.test(value) ? null : "Please enter a number";

    case "yes_no":
      return value === "yes" || value === "no" ? null : "Please choose Yes or No";

    case "rating": {
      const max = question.settings?.max ?? 5;
      const rating = Number(value);
      const isValid = Number.isInteger(rating) && rating >= 1 && rating <= max;
      return isValid ? null : `Please choose a rating from 1 to ${max}`;
    }

    case "multiple_choice":
    case "dropdown": {
      const isOption = question.options.some((option) => option.label === value);
      return isOption ? null : "Please choose one of the options";
    }
  }
}
