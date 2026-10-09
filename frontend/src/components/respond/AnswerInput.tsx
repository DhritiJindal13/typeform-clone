import type { Question } from "@/lib/types";

interface AnswerInputProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onChoose: (value: string) => void;
}

interface ChoiceButtonProps {
  keyLabel: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const textFieldClass =
  "w-full border-b-2 border-brand/40 bg-transparent pb-2 text-2xl text-brand outline-none placeholder:text-brand/40 focus:border-brand";

function ChoiceButton({ keyLabel, label, selected, onClick }: ChoiceButtonProps) {
  const buttonColors = selected
    ? "border-brand bg-brand text-white"
    : "border-brand/60 bg-brand-soft text-brand hover:bg-brand/10";
  const keyColors = selected
    ? "border-white bg-white text-brand"
    : "border-brand/60 bg-white text-brand";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded border px-3 py-2.5 text-left text-lg transition-colors ${buttonColors}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border text-xs font-semibold ${keyColors}`}
      >
        {keyLabel}
      </span>
      {label}
    </button>
  );
}

export default function AnswerInput({ question, value, onChange, onChoose }: AnswerInputProps) {
  if (question.type === "short_text") {
    return (
      <input
        autoFocus
        value={value}
        placeholder="Type your answer here..."
        onChange={(event) => onChange(event.target.value)}
        className={textFieldClass}
      />
    );
  }

  if (question.type === "long_text") {
    return (
      <textarea
        autoFocus
        rows={3}
        value={value}
        placeholder="Type your answer here..."
        onChange={(event) => onChange(event.target.value)}
        className={`${textFieldClass} resize-none`}
      />
    );
  }

  if (question.type === "email") {
    return (
      <input
        autoFocus
        type="email"
        value={value}
        placeholder="name@example.com"
        onChange={(event) => onChange(event.target.value)}
        className={textFieldClass}
      />
    );
  }

  if (question.type === "number") {
    return (
      <input
        autoFocus
        inputMode="decimal"
        value={value}
        placeholder="Type a number here..."
        onChange={(event) => onChange(event.target.value)}
        className={textFieldClass}
      />
    );
  }

  if (question.type === "multiple_choice") {
    return (
      <div className="flex max-w-md flex-col gap-2">
        {question.options.map((option, index) => (
          <ChoiceButton
            key={option.id}
            keyLabel={LETTERS[index]}
            label={option.label}
            selected={value === option.label}
            onClick={() => onChoose(option.label)}
          />
        ))}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <select
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${textFieldClass} max-w-md cursor-pointer`}
      >
        <option value="">Select an option</option>
        {question.options.map((option) => (
          <option key={option.id} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (question.type === "yes_no") {
    return (
      <div className="flex max-w-[14rem] flex-col gap-2">
        <ChoiceButton
          keyLabel="Y"
          label="Yes"
          selected={value === "yes"}
          onClick={() => onChoose("yes")}
        />
        <ChoiceButton
          keyLabel="N"
          label="No"
          selected={value === "no"}
          onClick={() => onChoose("no")}
        />
      </div>
    );
  }

  const stars = question.settings?.max ?? 5;
  const selectedRating = Number(value) || 0;

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: stars }, (_, index) => {
        const rating = index + 1;
        const isFilled = rating <= selectedRating;
        return (
          <button
            key={rating}
            onClick={() => onChoose(String(rating))}
            className={`flex h-16 w-16 flex-col items-center justify-center rounded border transition-colors ${
              isFilled
                ? "border-brand bg-brand text-white"
                : "border-brand/40 text-brand hover:bg-brand-soft"
            }`}
          >
            <span className="text-2xl leading-none">{isFilled ? "\u2605" : "\u2606"}</span>
            <span className="mt-1 text-xs">{rating}</span>
          </button>
        );
      })}
    </div>
  );
}
