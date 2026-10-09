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

  return (
    <div className={direction === "forward" ? "screen-forward" : "screen-back"}>
      <h1 className="flex items-start gap-3 text-3xl font-medium text-ink">
        <span className="mt-1.5 shrink-0 text-xl text-brand">{number} &rarr;</span>
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

        {question.type === "long_text" && (
          <p className="mt-2 text-sm text-muted">Shift + Enter to make a line break</p>
        )}

        {error && (
          <p role="alert" className="mt-4 inline-block rounded bg-danger/10 px-3 py-1.5 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="rounded bg-brand px-6 py-2.5 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {buttonLabel}
          </button>
          <span className="text-sm text-muted">press Enter</span>
        </div>
      </div>
    </div>
  );
}
