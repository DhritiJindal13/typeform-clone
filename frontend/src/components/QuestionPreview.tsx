import type { Question } from "@/lib/types";

interface QuestionPreviewProps {
  question: Question;
  number: number;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lineAnswerClass = "border-b-2 border-brand/40 pb-2 text-2xl text-brand/50";
const choiceClass =
  "flex items-center gap-3 rounded border border-brand/60 bg-brand-soft px-3 py-2 text-brand";
const keyClass =
  "flex h-6 w-6 items-center justify-center rounded border border-brand/60 bg-white text-xs font-semibold";

function AnswerArea({ question }: { question: Question }) {
  if (question.type === "short_text") {
    return <div className={lineAnswerClass}>Type your answer here...</div>;
  }

  if (question.type === "long_text") {
    return <div className={`${lineAnswerClass} pb-12`}>Type your answer here...</div>;
  }

  if (question.type === "email") {
    return <div className={lineAnswerClass}>name@example.com</div>;
  }

  if (question.type === "number") {
    return <div className={lineAnswerClass}>Type a number here...</div>;
  }

  if (question.type === "multiple_choice") {
    return (
      <ul className="flex max-w-sm flex-col gap-2">
        {question.options.map((option, index) => (
          <li key={option.id} className={choiceClass}>
            <span className={keyClass}>{LETTERS[index]}</span>
            {option.label}
          </li>
        ))}
      </ul>
    );
  }

  if (question.type === "dropdown") {
    return (
      <div className="flex max-w-sm items-center justify-between border-b-2 border-brand/40 pb-2 text-xl text-brand/50">
        <span>Type or select an option</span>
        <span>&#9662;</span>
      </div>
    );
  }

  if (question.type === "yes_no") {
    return (
      <ul className="flex max-w-[12rem] flex-col gap-2">
        <li className={choiceClass}>
          <span className={keyClass}>Y</span>Yes
        </li>
        <li className={choiceClass}>
          <span className={keyClass}>N</span>No
        </li>
      </ul>
    );
  }

  const stars = question.settings?.max ?? 5;
  return (
    <div className="flex gap-2">
      {Array.from({ length: stars }, (_, index) => (
        <div
          key={index}
          className="flex h-14 w-14 flex-col items-center justify-center rounded border border-brand/40 text-brand"
        >
          <span className="text-xl">&#9734;</span>
          <span className="text-xs">{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

export default function QuestionPreview({ question, number }: QuestionPreviewProps) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 rounded-lg bg-white px-14 py-16 shadow-sm">
      <div>
        <h2 className="flex items-start gap-3 text-3xl font-medium text-ink">
          <span className="mt-1.5 shrink-0 text-lg text-brand">{number} &rarr;</span>
          <span>
            {question.title || "Untitled question"}
            {question.required && <span className="ml-1 text-brand">*</span>}
          </span>
        </h2>
        {question.description && (
          <p className="mt-3 pl-12 text-lg text-muted">{question.description}</p>
        )}
      </div>

      <div className="pl-12">
        <AnswerArea question={question} />
      </div>

      <div className="flex items-center gap-3 pl-12">
        <span className="rounded bg-brand px-5 py-2 text-lg font-semibold text-white">OK</span>
        <span className="text-xs text-muted">press Enter</span>
      </div>
    </div>
  );
}
