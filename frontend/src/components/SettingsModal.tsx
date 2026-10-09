"use client";

import { useState } from "react";

interface SettingsModalProps {
  thankYouMessage: string;
  onSave: (message: string) => Promise<void>;
  onClose: () => void;
}

const COMING_SOON = [
  { title: "Theme", text: "Colors, fonts and background images." },
  { title: "Logic jumps", text: "Show different questions based on answers." },
  { title: "Integrations", text: "Webhooks, Google Sheets, Slack and more." },
  { title: "Sharing & collaboration", text: "Invite teammates to edit and view results." },
];

export default function SettingsModal({ thankYouMessage, onSave, onClose }: SettingsModalProps) {
  const [message, setMessage] = useState(thankYouMessage);
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = message.trim();
  const canSave = trimmed !== "" && trimmed !== thankYouMessage && !isSaving;

  async function save() {
    setIsSaving(true);
    await onSave(trimmed);
    setIsSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-paper p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Form settings</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded px-2 py-1 text-lg text-muted hover:bg-surface"
          >
            x
          </button>
        </div>

        <label className="mb-1 block text-sm font-semibold text-ink">Thank-you screen</label>
        <p className="mb-2 text-sm text-muted">Shown to people after they submit the form.</p>
        <textarea
          value={message}
          maxLength={300}
          rows={3}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full resize-none rounded border border-line px-3 py-2 text-ink outline-none focus:border-brand"
        />

        <div className="mb-6 mt-3 flex justify-end">
          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COMING_SOON.map((item) => (
            <div key={item.title} className="rounded-lg border border-line p-4">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.text}</p>
              <span className="mt-3 inline-block rounded bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
