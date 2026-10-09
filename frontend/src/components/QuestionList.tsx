"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QUESTION_TYPES } from "@/lib/questionTypes";
import type { Question, QuestionType } from "@/lib/types";
import QuestionTypeIcon from "@/components/QuestionTypeIcon";

interface QuestionRowProps {
  question: Question;
  number: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9h6.6l.7-9M6.5 7v4M9.5 7v4" />
    </svg>
  );
}

function QuestionRow({ question, number, isSelected, onSelect, onDelete }: QuestionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group mb-1 flex cursor-grab items-center rounded-md border-l-[3px] active:cursor-grabbing ${
        isSelected ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface"
      } ${isDragging ? "relative z-10 bg-white shadow-lg" : ""}`}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="w-4 shrink-0 text-sm font-semibold text-muted">{number}</span>
        <QuestionTypeIcon type={question.type} />
        <span className="truncate text-sm text-ink">{question.title || "Untitled question"}</span>
      </button>
      <button
        aria-label="Delete question"
        onClick={onDelete}
        className="mr-2 hidden rounded p-1.5 text-muted hover:bg-line hover:text-danger group-hover:block"
      >
        <TrashIcon />
      </button>
    </li>
  );
}

interface QuestionListProps {
  questions: Question[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: (type: QuestionType) => void;
  onDelete: (question: Question) => void;
  onReorder: (questionIds: number[]) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: QuestionListProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function addQuestion(type: QuestionType) {
    setMenuOpen(false);
    onAdd(type);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((question) => question.id === active.id);
    const newIndex = questions.findIndex((question) => question.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);
    onReorder(reordered.map((question) => question.id));
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-white">
      <div className="relative border-b border-line p-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-brand bg-white py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
        >
          <span className="text-lg leading-none">+</span> Add question
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-3 right-3 top-full z-20 mt-1 rounded-md border border-line bg-white py-1 shadow-lg">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Question types
              </p>
              {QUESTION_TYPES.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addQuestion(item.type)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-surface"
                >
                  <QuestionTypeIcon type={item.type} />
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {questions.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted">
            No questions yet. Add your first one above.
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={questions.map((question) => question.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {questions.map((question, index) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  number={index + 1}
                  isSelected={question.id === selectedId}
                  onSelect={() => onSelect(question.id)}
                  onDelete={() => onDelete(question)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}
