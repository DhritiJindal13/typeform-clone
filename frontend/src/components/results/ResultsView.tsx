"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import type { FormDetail, ResponseList, ResultsSummary } from "@/lib/types";
import { useToast } from "@/components/Toast";
import PageLoading from "@/components/PageLoading";
import ConfirmDialog from "@/components/ConfirmDialog";
import ThemeToggle from "@/components/ThemeToggle";
import SummaryCard from "./SummaryCard";
import ResponsesTable from "./ResponsesTable";
import ResponsePanel from "./ResponsePanel";

type Tab = "summary" | "responses";

export default function ResultsView() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);
  const toast = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [summary, setSummary] = useState<ResultsSummary | null>(null);
  const [responses, setResponses] = useState<ResponseList | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("summary");
  const [openResponseId, setOpenResponseId] = useState<number | null>(null);
  const [responseToDelete, setResponseToDelete] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [loadedForm, loadedSummary, loadedResponses] = await Promise.all([
        api.getForm(formId),
        api.getSummary(formId),
        api.listResponses(formId),
      ]);
      setForm(loadedForm);
      setSummary(loadedSummary);
      setResponses(loadedResponses);
    } catch {
      setLoadFailed(true);
    }
  }, [formId]);

  useEffect(() => {
    // Fetching on mount is the intended use of an effect here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  async function deleteResponse() {
    if (responseToDelete === null) return;
    const id = responseToDelete;
    setResponseToDelete(null);

    try {
      await api.deleteResponse(id);
      setOpenResponseId(null);
      toast("Response deleted");
      await loadAll();
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

  if (!form || !summary || !responses) return <PageLoading />;

  const tabClass = (name: Tab) =>
    `border-b-2 px-1 pb-3 text-sm font-semibold ${
      tab === name ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center bg-chrome px-4 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Back to workspace"
            className="rounded px-2 py-1 text-lg text-white/80 hover:bg-white/10 hover:text-white"
          >
            &larr;
          </Link>
          <h1 className="truncate text-base font-semibold">{form.title}</h1>
        </div>

        <nav className="flex h-full items-stretch">
          <Link
            href={`/forms/${form.id}/edit`}
            className="flex h-full items-center border-b-2 border-transparent px-4 text-sm font-medium text-white/70 hover:text-white"
          >
            Create
          </Link>
          <span className="flex h-full items-center border-b-2 border-white px-4 text-sm font-medium text-white">
            Results
          </span>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white" />
          <a
            href={api.exportUrl(form.id)}
            className="rounded-md bg-white/15 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/25"
          >
            Export CSV
          </a>
        </div>
      </header>

      <div className="flex gap-6 border-b border-line px-6 pt-3">
        <button className={tabClass("summary")} onClick={() => setTab("summary")}>
          Summary
        </button>
        <button className={tabClass("responses")} onClick={() => setTab("responses")}>
          Responses ({responses.total})
        </button>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {responses.total === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-16 text-center">
            <p className="mb-1 text-lg font-semibold">No responses yet</p>
            <p className="text-muted">Share your form link to start collecting answers.</p>
          </div>
        ) : tab === "summary" ? (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">{summary.total_responses} total responses</p>
            {summary.questions.map((item, index) => (
              <SummaryCard key={item.question_id} summary={item} number={index + 1} />
            ))}
          </div>
        ) : (
          <ResponsesTable
            questions={form.questions}
            responses={responses.responses}
            onOpen={setOpenResponseId}
          />
        )}
      </main>

      {openResponseId !== null && (
        <ResponsePanel
          key={openResponseId}
          responseId={openResponseId}
          onClose={() => setOpenResponseId(null)}
          onDelete={() => setResponseToDelete(openResponseId)}
        />
      )}

      {responseToDelete !== null && (
        <ConfirmDialog
          title="Delete this response?"
          message="This response will be deleted for good."
          confirmLabel="Delete"
          onConfirm={deleteResponse}
          onCancel={() => setResponseToDelete(null)}
        />
      )}
    </div>
  );
}
