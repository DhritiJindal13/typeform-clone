"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { ResponseDetail } from "@/lib/types";

interface ResponsePanelProps {
  responseId: number;
  onClose: () => void;
  onDelete: () => void;
}

export default function ResponsePanel({ responseId, onClose, onDelete }: ResponsePanelProps) {
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getResponse(responseId)
      .then(setResponse)
      .catch(() => setFailed(true));
  }, [responseId]);

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col bg-paper shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Response #{responseId}</h2>
            {response && (
              <p className="text-sm text-muted">{formatDateTime(response.submitted_at)}</p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded px-2 py-1 text-lg text-muted hover:bg-surface"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {failed && <p className="text-danger">This response could not be loaded.</p>}
          {!response && !failed && <p className="text-muted">Loading...</p>}

          {response?.answers.map((answer, index) => (
            <div key={answer.question_id} className="mb-6">
              <p className="mb-1 text-sm text-muted">
                {index + 1}. {answer.title}
              </p>
              {answer.value ? (
                <p className="whitespace-pre-wrap text-base text-ink">{answer.value}</p>
              ) : (
                <p className="text-base italic text-muted">No answer</p>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-line px-6 py-4">
          <button
            onClick={onDelete}
            className="rounded-md px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            Delete response
          </button>
        </div>
      </aside>
    </div>
  );
}
