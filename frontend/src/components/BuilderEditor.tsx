"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import type { FormDetail, Question, QuestionType } from "@/lib/types";
import { useToast } from "@/components/Toast";
import BuilderHeader from "@/components/BuilderHeader";
import QuestionList from "@/components/QuestionList";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BuilderEditor() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);
  const toast = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  useEffect(() => {
    api
      .getForm(formId)
      .then((loadedForm) => {
        setForm(loadedForm);
        setSelectedId(loadedForm.questions[0]?.id ?? null);
      })
      .catch(() => setLoadFailed(true));
  }, [formId]);

  async function renameForm(title: string) {
    try {
      setForm(await api.updateForm(formId, { title }));
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
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>;
  }

  const selectedQuestion = form.questions.find((question) => question.id === selectedId);

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
        />

        <main className="flex flex-1 items-center justify-center bg-surface">
          <p className="text-muted">
            {selectedQuestion ? selectedQuestion.title : "Add a question to get started"}
          </p>
        </main>
      </div>

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
