"use client";

import { useState } from "react";
import { QUESTION_TYPES, getQuestionType } from "@/lib/questionTypes";
import type { Question, QuestionType } from "@/lib/types";

interface QuestionListProps {
  questions: Question[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: (type: QuestionType) => void;
  onDelete: (question: Question) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: QuestionListProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function addQuestion(type: QuestionType) {
    setMenuOpen(false);
    onAdd(type);
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-white">
      <div className="relative border-b border-line p-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full rounded-md bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Add question
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-3 right-3 top-full z-20 mt-1 rounded-md border border-line bg-white py-1 shadow-lg">
              {QUESTION_TYPES.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addQuestion(item.type)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-surface"
                >
                  <span className="flex h-6 w-9 items-center justify-center rounded bg-brand-soft text-xs font-bold text-brand">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {questions.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted">
            No questions yet. Add your first one above.
          </li>
        )}

        {questions.map((question, index) => (
          <li
            key={question.id}
            className={`group flex items-center rounded-md ${
              question.id === selectedId ? "bg-brand-soft" : "hover:bg-surface"
            }`}
          >
            <button
              onClick={() => onSelect(question.id)}
              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
            >
              <span className="w-5 text-sm font-semibold text-muted">{index + 1}</span>
              <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-brand-soft text-xs font-bold text-brand">
                {getQuestionType(question.type).icon}
              </span>
              <span className="truncate text-sm text-ink">
                {question.title || "Untitled question"}
              </span>
            </button>
            <button
              aria-label="Delete question"
              onClick={() => onDelete(question)}
              className="mr-2 hidden rounded px-2 py-1 text-sm text-muted hover:bg-line group-hover:block"
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
