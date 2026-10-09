"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import type { FormDetail, Question, QuestionChanges, QuestionType } from "@/lib/types";
import { useToast } from "@/components/Toast";
import BuilderHeader from "@/components/BuilderHeader";
import QuestionList from "@/components/QuestionList";
import QuestionPreview from "@/components/QuestionPreview";
import QuestionSettings from "@/components/QuestionSettings";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormFiller from "@/components/respond/FormFiller";
import SettingsModal from "@/components/SettingsModal";

export default function BuilderEditor() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);
  const toast = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    api
      .getForm(formId)
      .then((loadedForm) => {
        setForm(loadedForm);
        setSelectedId(loadedForm.questions[0]?.id ?? null);
      })
      .catch(() => setLoadFailed(true));
  }, [formId]);

  // Escape closes the preview
  useEffect(() => {
    if (!isPreviewing) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsPreviewing(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isPreviewing]);

  async function renameForm(title: string) {
    try {
      setForm(await api.updateForm(formId, { title }));
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function saveThankYou(message: string) {
    try {
      setForm(await api.updateForm(formId, { thank_you_message: message }));
      toast("Settings saved");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function togglePublish() {
    if (!form) return;
    try {
      if (form.status === "published") {
        setForm(await api.unpublishForm(formId));
        toast("Form unpublished");
      } else {
        setForm(await api.publishForm(formId));
        toast("Form published");
      }
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function copyLink() {
    if (!form) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
      toast("Link copied");
    } catch {
      toast("Could not copy the link", "error");
    }
  }

  async function addQuestion(type: QuestionType) {
    try {
      const question = await api.createQuestion(formId, { type });
      setForm((current) =>
        current ? { ...current, questions: [...current.questions, question] } : current
      );
      setSelectedId(question.id);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  function changeQuestion(id: number, changes: Partial<Question>) {
    setForm((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) =>
              question.id === id ? { ...question, ...changes } : question
            ),
          }
        : current
    );
  }

  async function saveQuestion(id: number, changes: QuestionChanges) {
    try {
      await api.updateQuestion(id, changes);
    } catch (error) {
      toast(errorMessage(error), "error");
      const freshForm = await api.getForm(formId).catch(() => null);
      if (freshForm) setForm(freshForm);
    }
  }

  async function reorderQuestions(questionIds: number[]) {
    setForm((current) => {
      if (!current) return current;
      const reordered = questionIds
        .map((id) => current.questions.find((question) => question.id === id))
        .filter((question): question is Question => question !== undefined)
        .map((question, position) => ({ ...question, position }));
      return { ...current, questions: reordered };
    });

    try {
      await api.reorderQuestions(formId, questionIds);
    } catch (error) {
      toast(errorMessage(error), "error");
      const freshForm = await api.getForm(formId).catch(() => null);
      if (freshForm) setForm(freshForm);
    }
  }

  async function deleteSelectedQuestion() {
    if (!form || !questionToDelete) return;
    const deletedId = questionToDelete.id;
    setQuestionToDelete(null);

    try {
      await api.deleteQuestion(deletedId);
      const updatedForm = await api.getForm(formId);
      const oldIndex = form.questions.findIndex((question) => question.id === deletedId);
      const nextIndex = Math.min(oldIndex, updatedForm.questions.length - 1);
      setForm(updatedForm);
      setSelectedId(updatedForm.questions[nextIndex]?.id ?? null);
      toast("Question deleted");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  if (loadFailed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-ink">
        <p className="text-lg font-semibold">This form could not be found.</p>
        <Link href="/" className="text-brand hover:underline">
          Back to my workspace
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>
    );
  }

  const selectedIndex = form.questions.findIndex((question) => question.id === selectedId);
  const selectedQuestion = selectedIndex >= 0 ? form.questions[selectedIndex] : undefined;

  return (
    <div className="flex h-screen flex-col bg-white text-ink">
      <BuilderHeader
        form={form}
        onRename={renameForm}
        onTogglePublish={togglePublish}
        onCopyLink={copyLink}
      />

      <div className="flex min-h-0 flex-1">
        <QuestionList
          questions={form.questions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addQuestion}
          onDelete={setQuestionToDelete}
          onReorder={reorderQuestions}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-surface">
          <div className="flex justify-end gap-2 border-b border-line bg-white px-4 py-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-md bg-surface px-4 py-1.5 text-sm font-semibold hover:bg-line"
            >
              Settings
            </button>
            <button
              onClick={() => setIsPreviewing(true)}
              disabled={form.questions.length === 0}
              className="rounded-md bg-surface px-4 py-1.5 text-sm font-semibold hover:bg-line disabled:opacity-40"
            >
              Preview
            </button>
          </div>

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-8">
            {selectedQuestion ? (
              <QuestionPreview
                question={selectedQuestion}
                number={selectedIndex + 1}
                onChange={(changes) => changeQuestion(selectedQuestion.id, changes)}
                onSave={(changes) => saveQuestion(selectedQuestion.id, changes)}
              />
            ) : (
              <p className="text-muted">Add a question to get started</p>
            )}
          </main>
        </div>

        <QuestionSettings
          question={selectedQuestion}
          onChange={(changes) => selectedQuestion && changeQuestion(selectedQuestion.id, changes)}
          onSave={(changes) => selectedQuestion && saveQuestion(selectedQuestion.id, changes)}
        />
      </div>

      {isSettingsOpen && (
        <SettingsModal
          thankYouMessage={form.thank_you_message}
          onSave={saveThankYou}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isPreviewing && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-ink px-4 py-2 text-sm text-white">
            <span>Preview mode: answers are not saved</span>
            <button
              onClick={() => setIsPreviewing(false)}
              className="rounded bg-white/15 px-3 py-1 font-semibold hover:bg-white/25"
            >
              Close preview
            </button>
          </div>
          <FormFiller
            preview={{
              title: form.title,
              slug: form.slug,
              thank_you_message: form.thank_you_message,
              questions: form.questions,
            }}
          />
        </div>
      )}

      {questionToDelete && (
        <ConfirmDialog
          title="Delete this question?"
          message="Answers already collected for this question will be deleted too."
          confirmLabel="Delete"
          onConfirm={deleteSelectedQuestion}
          onCancel={() => setQuestionToDelete(null)}
        />
      )}
    </div>
  );
}
