"use client";

import { useState } from "react";
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

interface RatingInputProps {
  max: number;
  value: number;
  onChoose: (value: string) => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const textFieldClass =
  "w-full border-b-2 border-brand/30 bg-transparent pb-2 text-3xl text-brand outline-none transition-colors placeholder:text-brand/40 focus:border-brand";

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

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3.5,6 8,10.5 12.5,6" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="40"
      height="40"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="8,1.8 10,6 14.5,6.5 11.1,9.5 12.1,14 8,11.7 3.9,14 4.9,9.5 1.5,6.5 6,6" />
    </svg>
  );
}

function ChoiceButton({ keyLabel, label, selected, onClick }: ChoiceButtonProps) {
  const buttonColors = selected
    ? "border-brand bg-brand/20"
    : "border-brand/50 bg-brand/5 hover:bg-brand/15";
  const keyColors = selected
    ? "border-brand bg-brand text-white"
    : "border-brand/60 bg-paper text-brand";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-xl text-brand transition-colors ${buttonColors}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border text-xs font-semibold ${keyColors}`}
      >
        {keyLabel}
      </span>
      <span className="flex-1">{label}</span>
      {selected && <CheckIcon />}
    </button>
  );
}

function RatingInput({ max, value, onChoose }: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-wrap gap-3" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, index) => {
        const rating = index + 1;
        return (
          <button
            key={rating}
            onClick={() => onChoose(String(rating))}
            onMouseEnter={() => setHovered(rating)}
            className="flex flex-col items-center gap-1 text-brand transition-transform hover:scale-110"
          >
            <StarIcon filled={rating <= active} />
            <span className="text-sm">{rating}</span>
          </button>
        );
      })}
    </div>
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
      <div className="relative max-w-md text-brand">
        <select
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${textFieldClass} cursor-pointer appearance-none pr-8`}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 top-2">
          <ChevronIcon />
        </span>
      </div>
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

  return (
    <RatingInput max={question.settings?.max ?? 5} value={Number(value) || 0} onChoose={onChoose} />
  );
}
