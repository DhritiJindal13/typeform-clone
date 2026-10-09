"use client";

import { getQuestionType } from "@/lib/questionTypes";
import type { Question, QuestionChanges, QuestionOption } from "@/lib/types";
import QuestionTypeIcon from "@/components/QuestionTypeIcon";

interface QuestionSettingsProps {
  question: Question | undefined;
  onChange: (changes: Partial<Question>) => void;
  onSave: (changes: QuestionChanges) => void;
}

const RATING_SIZES = [3, 4, 5, 7, 10];

const panelClass = "w-80 shrink-0 overflow-y-auto border-l border-line bg-paper";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";
const fieldClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-5 py-4">
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

export default function QuestionSettings({ question, onChange, onSave }: QuestionSettingsProps) {
  if (!question) {
    return (
      <aside className={panelClass}>
        <p className="p-5 text-sm text-muted">Select a question to edit its settings.</p>
      </aside>
    );
  }

  const hasChoices = question.type === "multiple_choice" || question.type === "dropdown";
  const ratingSize = question.settings?.max ?? 5;

  function saveOptions(options: QuestionOption[]) {
    onSave({ options: options.map((option) => option.label.trim()) });
  }

  function changeLabel(index: number, label: string) {
    onChange({
      options: question!.options.map((option, i) => (i === index ? { ...option, label } : option)),
    });
  }

  function addOption() {
    const position = question!.options.length;
    const options = [
      ...question!.options,
      { id: -Date.now(), label: `Option ${position + 1}`, position },
    ];
    onChange({ options });
    saveOptions(options);
  }

  function removeOption(index: number) {
    const options = question!.options.filter((_, i) => i !== index);
    onChange({ options });
    saveOptions(options);
  }

  function changeRatingSize(max: number) {
    onChange({ settings: { max } });
    onSave({ settings: { max } });
  }

  function toggleRequired() {
    onChange({ required: !question!.required });
    onSave({ required: !question!.required });
  }

  return (
    <aside className={panelClass}>
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <QuestionTypeIcon type={question.type} />
        <h2 className="text-sm font-semibold text-ink">{getQuestionType(question.type).label}</h2>
      </div>

      <Section label="Question">
        <textarea
          value={question.title}
          rows={2}
          maxLength={300}
          onChange={(event) => onChange({ title: event.target.value })}
          onBlur={() => onSave({ title: question.title.trim() })}
          className={`${fieldClass} resize-none`}
        />
      </Section>

      <Section label="Description">
        <textarea
          value={question.description ?? ""}
          rows={2}
          maxLength={500}
          placeholder="Add a short help text"
          onChange={(event) => onChange({ description: event.target.value })}
          onBlur={() => onSave({ description: (question.description ?? "").trim() })}
          className={`${fieldClass} resize-none`}
        />
      </Section>

      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="text-sm font-medium text-ink">Required</span>
        <button
          role="switch"
          aria-checked={question.required}
          onClick={toggleRequired}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            question.required ? "bg-brand" : "bg-line"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              question.required ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {hasChoices && (
        <Section label="Choices">
          <ul className="flex flex-col gap-2">
            {question.options.map((option, index) => (
              <li key={option.id} className="flex items-center gap-2">
                <input
                  value={option.label}
                  maxLength={300}
                  onChange={(event) => changeLabel(index, event.target.value)}
                  onBlur={() => saveOptions(question.options)}
                  className={fieldClass}
                />
                <button
                  aria-label="Remove choice"
                  disabled={question.options.length <= 1}
                  onClick={() => removeOption(index)}
                  className="rounded p-1.5 text-muted hover:bg-surface hover:text-danger disabled:opacity-30"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={addOption}
            className="mt-3 text-sm font-semibold text-brand hover:underline"
          >
            + Add choice
          </button>
        </Section>
      )}

      {question.type === "rating" && (
        <Section label="Number of stars">
          <select
            value={ratingSize}
            onChange={(event) => changeRatingSize(Number(event.target.value))}
            className={fieldClass}
          >
            {RATING_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} stars
              </option>
            ))}
          </select>
        </Section>
      )}
    </aside>
  );
}
