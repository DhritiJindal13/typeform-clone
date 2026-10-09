"use client";

import { useState } from "react";
import Link from "next/link";
import type { FormDetail } from "@/lib/types";

interface BuilderHeaderProps {
  form: FormDetail;
  onRename: (title: string) => void;
  onTogglePublish: () => void;
  onCopyLink: () => void;
}

export default function BuilderHeader({
  form,
  onRename,
  onTogglePublish,
  onCopyLink,
}: BuilderHeaderProps) {
  const [title, setTitle] = useState(form.title);
  const isPublished = form.status === "published";

  function saveTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(form.title);
      return;
    }
    if (trimmed !== form.title) onRename(trimmed);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="rounded px-2 py-1 text-sm font-medium text-muted hover:bg-surface">
          &larr; Back
        </Link>
        <input
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="w-72 rounded border border-transparent px-2 py-1 text-base font-semibold text-ink hover:border-line focus:border-brand focus:outline-none"
        />
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPublished ? "bg-success-soft text-success" : "bg-surface text-muted"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isPublished && (
          <button
            onClick={onCopyLink}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
          >
            Copy link
          </button>
        )}
        <button
          onClick={onTogglePublish}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${
            isPublished
              ? "bg-surface text-ink hover:bg-line"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>
    </header>
  );
}
