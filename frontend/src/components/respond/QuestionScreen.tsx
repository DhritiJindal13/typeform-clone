import type { Question } from "@/lib/types";
import AnswerInput from "./AnswerInput";

interface QuestionScreenProps {
  question: Question;
  number: number;
  direction: "forward" | "back";
  value: string;
  error: string | undefined;
  isLast: boolean;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onChoose: (value: string) => void;
  onNext: () => void;
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3,8.5 6.5,12 13,4.5" />
    </svg>
  );
}

export default function QuestionScreen({
  question,
  number,
  direction,
  value,
  error,
  isLast,
  isSubmitting,
  onChange,
  onChoose,
  onNext,
}: QuestionScreenProps) {
  const buttonLabel = isSubmitting ? "Submitting..." : isLast ? "Submit" : "OK";
  const isLongText = question.type === "long_text";

  return (
    <div className={direction === "forward" ? "screen-forward" : "screen-back"}>
      <h1 className="flex items-start gap-3 text-3xl font-medium leading-snug text-ink">
        <span className="mt-2 flex shrink-0 items-center gap-1 text-lg text-brand">
          {number}
          <ArrowIcon />
        </span>
        <span>
          {question.title}
          {question.required && <span className="ml-1 text-brand">*</span>}
        </span>
      </h1>

      {question.description && (
        <p className="mt-3 pl-12 text-xl text-muted">{question.description}</p>
      )}

      <div className="mt-8 pl-12">
        <AnswerInput question={question} value={value} onChange={onChange} onChoose={onChoose} />

        {error && (
          <p
            role="alert"
            className="mt-4 inline-block rounded bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {buttonLabel}
            {!isSubmitting && <CheckIcon />}
          </button>
          <span className="text-sm text-muted">
            {isLongText ? "Shift \u21E7 + Enter \u21B5 to make a line break" : "press Enter \u21B5"}
          </span>
        </div>
      </div>
    </div>
  );
}
