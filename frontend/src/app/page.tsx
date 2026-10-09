"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import type { FormSummary } from "@/lib/types";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormRow from "@/components/FormRow";
import ThemeToggle from "@/components/ThemeToggle";

export default function WorkspacePage() {
  const router = useRouter();
  const toast = useToast();

  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormSummary | null>(null);

  useEffect(() => {
    api
      .listForms()
      .then(setForms)
      .catch((error) => toast(errorMessage(error), "error"));
  }, [refreshCount, toast]);

  async function runAndReload(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast(successMessage);
      setRefreshCount((count) => count + 1);
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
    <div className="min-h-screen bg-surface text-ink">
      <header className="flex h-14 items-center justify-between bg-chrome px-6 text-white">
        <span className="text-lg font-bold tracking-tight">Typeform Clone</span>
        <div className="flex items-center gap-2">
          <ThemeToggle className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white" />
          <button
            onClick={createForm}
            disabled={isCreating}
            className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-[#262627] hover:bg-white/90 disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "+ Create typeform"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold">My workspace</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          {forms === null ? "Loading your forms..." : `${forms.length} forms`}
        </p>

        {forms !== null && forms.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-paper py-16 text-center">
            <p className="mb-1 text-lg font-semibold">No forms yet</p>
            <p className="text-muted">Click &quot;Create typeform&quot; to build your first one.</p>
          </div>
        )}

        {forms !== null && forms.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-paper">
            {forms.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                onRename={(title) =>
                  runAndReload(() => api.updateForm(form.id, { title }), "Form renamed")
                }
                onDuplicate={() => runAndReload(() => api.duplicateForm(form.id), "Form duplicated")}
                onPublish={() => runAndReload(() => api.publishForm(form.id), "Form published")}
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
