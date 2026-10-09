"use client";

import ThemeToggle from "@/components/ThemeToggle";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import type { FormSummary } from "@/lib/types";
import { useToast } from "@/components/Toast";
import FormRow from "@/components/FormRow";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormSummary | null>(null);

  const loadForms = useCallback(async () => {
    try {
      setForms(await api.listForms());
    } catch (error) {
      setForms([]);
      toast(errorMessage(error), "error");
    }
  }, [toast]);

  useEffect(() => {
    // Fetching on mount is the intended use of an effect here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadForms();
  }, [loadForms]);

  async function runAndReload(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast(successMessage);
      await loadForms();
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function createForm() {
    setIsCreating(true);
    try {
      const form = await api.createForm("Untitled form");
      router.push(`/forms/${form.id}/edit`);
    } catch (error) {
      toast(errorMessage(error), "error");
      setIsCreating(false);
    }
  }

  async function copyLink(form: FormSummary) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
      toast("Link copied");
    } catch {
      toast("Could not copy the link", "error");
    }
  }

  async function deleteSelectedForm() {
    if (!formToDelete) return;
    const form = formToDelete;
    setFormToDelete(null);
    await runAndReload(() => api.deleteForm(form.id), "Form deleted");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex h-14 items-center justify-between border-b border-line px-6">
        <span className="text-lg font-bold">Typeform Clone</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-medium text-white">
          D
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">My workspace</h1>
            <ThemeToggle />
          </div>
          <button
            onClick={createForm}
            disabled={isCreating}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "+ Create typeform"}
          </button>
        </div>

        {forms === null && <p className="text-muted">Loading your forms...</p>}

        {forms !== null && forms.length === 0 && (
          <div className="rounded-lg border border-dashed border-line py-16 text-center">
            <p className="mb-1 text-lg font-semibold text-ink">No forms yet</p>
            <p className="text-muted">Click &quot;Create typeform&quot; to build your first one.</p>
          </div>
        )}

        {forms !== null && forms.length > 0 && (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {forms.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                onRename={(title) =>
                  runAndReload(() => api.updateForm(form.id, { title }), "Form renamed")
                }
                onDuplicate={() =>
                  runAndReload(() => api.duplicateForm(form.id), "Form duplicated")
                }
                onPublish={() =>
                  runAndReload(() => api.publishForm(form.id), "Form published")
                }
                onUnpublish={() =>
                  runAndReload(() => api.unpublishForm(form.id), "Form unpublished")
                }
                onCopyLink={() => copyLink(form)}
                onDelete={() => setFormToDelete(form)}
              />
            ))}
          </ul>
        )}
      </main>

      {formToDelete && (
        <ConfirmDialog
          title="Delete this form?"
          message={`"${formToDelete.title}" and all of its responses will be deleted for good.`}
          confirmLabel="Delete"
          onConfirm={deleteSelectedForm}
          onCancel={() => setFormToDelete(null)}
        />
      )}
    </div>
  );
}
