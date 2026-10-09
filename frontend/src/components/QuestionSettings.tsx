import { getQuestionType } from "@/lib/questionTypes";
import type { Question, QuestionChanges, QuestionOption } from "@/lib/types";

interface QuestionSettingsProps {
  question: Question | undefined;
  onChange: (changes: Partial<Question>) => void;
  onSave: (changes: QuestionChanges) => void;
}

interface SettingsFieldsProps {
  question: Question;
  onChange: (changes: Partial<Question>) => void;
  onSave: (changes: QuestionChanges) => void;
}

const panelClass = "w-80 shrink-0 overflow-y-auto border-l border-line bg-white p-5";
const fieldClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

const CHOICE_TYPES = ["multiple_choice", "dropdown"];
const RATING_SIZES = [3, 4, 5, 6, 7, 8, 9, 10];

function renumber(options: QuestionOption[]): QuestionOption[] {
  return options.map((option, index) => ({ ...option, position: index }));
}

function SettingsFields({ question, onChange, onSave }: SettingsFieldsProps) {
  const isChoice = CHOICE_TYPES.includes(question.type);
  const ratingSize = question.settings?.max ?? 5;

  function saveTitle() {
    const title = question.title.trim() || "Untitled question";
    onChange({ title });
    onSave({ title });
  }

  function toggleRequired() {
    const required = !question.required;
    onChange({ required });
    onSave({ required });
  }

  function changeOptionLabel(index: number, label: string) {
    onChange({
      options: question.options.map((option, i) => (i === index ? { ...option, label } : option)),
    });
  }

  function saveOptions(options: QuestionOption[]) {
    onSave({ options: options.map((option) => option.label) });
  }

  function addOption() {
    const newOption = {
      id: -Date.now(),
      label: `Option ${question.options.length + 1}`,
      position: 0,
    };
    const options = renumber([...question.options, newOption]);
    onChange({ options });
    saveOptions(options);
  }

  function removeOption(index: number) {
    const options = renumber(question.options.filter((_, i) => i !== index));
    onChange({ options });
    saveOptions(options);
  }

  function changeRatingSize(size: number) {
    onChange({ settings: { max: size } });
    onSave({ settings: { max: size } });
  }

  return (
    <aside className={panelClass}>
      <p className="mb-5 text-sm font-semibold text-ink">{getQuestionType(question.type).label}</p>

      <div className="mb-5">
        <label className={labelClass}>Question</label>
        <textarea
          rows={2}
          value={question.title}
          maxLength={500}
          onChange={(event) => onChange({ title: event.target.value })}
          onBlur={saveTitle}
          className={fieldClass}
        />
      </div>

      <div className="mb-5">
        <label className={labelClass}>Description</label>
        <textarea
          rows={2}
          value={question.description ?? ""}
          maxLength={2000}
          placeholder="Add a short help text"
          onChange={(event) => onChange({ description: event.target.value })}
          onBlur={() => onSave({ description: question.description ?? "" })}
          className={fieldClass}
        />
      </div>

      <div className="mb-5 flex items-center justify-between">
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
              question.required ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {isChoice && (
        <div className="mb-5">
          <label className={labelClass}>Choices</label>
          <ul className="flex flex-col gap-2">
            {question.options.map((option, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  value={option.label}
                  maxLength={300}
                  onChange={(event) => changeOptionLabel(index, event.target.value)}
                  onBlur={() => saveOptions(question.options)}
                  className={fieldClass}
                />
                <button
                  aria-label="Remove choice"
                  disabled={question.options.length <= 1}
                  onClick={() => removeOption(index)}
                  className="rounded px-2 py-1 text-muted hover:bg-surface disabled:opacity-30"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={addOption}
            className="mt-2 text-sm font-medium text-brand hover:underline"
          >
            + Add choice
          </button>
        </div>
      )}

      {question.type === "rating" && (
        <div className="mb-5">
          <label className={labelClass}>Number of stars</label>
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
        </div>
      )}
    </aside>
  );
}

export default function QuestionSettings({ question, onChange, onSave }: QuestionSettingsProps) {
  if (!question) {
    return (
      <aside className={panelClass}>
        <p className="text-sm text-muted">Select a question to edit its settings.</p>
      </aside>
    );
  }

  return <SettingsFields question={question} onChange={onChange} onSave={onSave} />;
}
