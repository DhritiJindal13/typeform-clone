"use client";

import { useEffect, useRef } from "react";
import type { Question, QuestionChanges } from "@/lib/types";

interface QuestionPreviewProps {
  question: Question;
  number: number;
  onChange: (changes: Partial<Question>) => void;
  onSave: (changes: QuestionChanges) => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lineAnswerClass = "border-b-2 border-brand/40 pb-2 text-2xl text-brand/50";
const choiceClass =
  "flex items-center gap-3 rounded border border-brand/60 bg-brand-soft px-3 py-2 text-brand";
const keyClass =
  "flex h-6 w-6 items-center justify-center rounded border border-brand/60 bg-paper text-xs font-semibold";

interface AutoTextareaProps {
  value: string;
  placeholder: string;
  className: string;
  maxLength: number;
  onChange: (value: string) => void;
  onBlur: () => void;
}

// A text box that grows with its content and looks like plain text until you click it.
// Enter finishes editing instead of adding a new line.
function AutoTextarea({ value, placeholder, className, maxLength, onChange, onBlur }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={`block w-full resize-none overflow-hidden rounded bg-transparent outline-none placeholder:text-muted/50 hover:bg-surface focus:bg-transparent ${className}`}
    />
  );
}

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

export default function QuestionPreview({ question, number, onChange, onSave }: QuestionPreviewProps) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 rounded-lg bg-paper px-14 py-16 shadow-sm">
      <div>
        <div className="flex items-start gap-3">
          <span className="mt-2 shrink-0 text-lg text-brand">{number} &rarr;</span>
          <div className="min-w-0 flex-1">
            <AutoTextarea
              value={question.title}
              placeholder="Your question here"
              maxLength={300}
              className="text-3xl font-medium text-ink"
              onChange={(title) => onChange({ title })}
              onBlur={() => onSave({ title: question.title.trim() })}
            />
          </div>
          {question.required && <span className="mt-1 text-3xl text-brand">*</span>}
        </div>

        <div className="mt-3 pl-12">
          <AutoTextarea
            value={question.description ?? ""}
            placeholder="Description (optional)"
            maxLength={500}
            className="text-lg text-muted"
            onChange={(description) => onChange({ description })}
            onBlur={() => onSave({ description: (question.description ?? "").trim() })}
          />
        </div>
      </div>

      <div className="pl-12">
        <AnswerArea question={question} />
      </div>

      <div className="flex items-center gap-3 pl-12">
        <span className="rounded bg-brand px-5 py-2 text-lg font-semibold text-white">OK</span>
        <span className="text-xs text-muted">
          {question.type === "long_text"
            ? "Shift \u21E7 + Enter \u21B5 to make a line break"
            : "press Enter \u21B5"}
        </span>
      </div>
    </div>
  );
}
