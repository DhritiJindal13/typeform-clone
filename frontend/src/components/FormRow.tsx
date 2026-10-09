"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/format";
import type { FormSummary } from "@/lib/types";

interface FormRowProps {
  form: FormSummary;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

const menuItemClass = "block w-full px-4 py-2 text-left text-sm text-ink hover:bg-surface";

export default function FormRow({
  form,
  onRename,
  onDuplicate,
  onPublish,
  onUnpublish,
  onCopyLink,
  onDelete,
}: FormRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(form.title);
  const isPublished = form.status === "published";
  const responseLabel = form.response_count === 1 ? "response" : "responses";

  function startRename() {
    setMenuOpen(false);
    setTitle(form.title);
    setIsRenaming(true);
  }

  function finishRename() {
    const trimmed = title.trim();
    setIsRenaming(false);
    if (trimmed && trimmed !== form.title) onRename(trimmed);
  }

  function choose(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <li className="flex items-center gap-4 px-5 py-4 hover:bg-surface">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${isPublished ? "bg-success" : "bg-line"}`}
        title={isPublished ? "Published" : "Draft"}
      />

      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <input
            autoFocus
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={finishRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") setIsRenaming(false);
            }}
            className="w-full rounded border border-brand bg-paper px-2 py-1 text-base font-semibold text-ink outline-none"
          />
        ) : (
          <Link
            href={`/forms/${form.id}/edit`}
            className="block truncate text-base font-semibold text-ink hover:text-brand"
          >
            {form.title}
          </Link>
        )}
        <p className="mt-0.5 text-sm text-muted">
          {isPublished ? "Published" : "Draft"} &middot; Updated {timeAgo(form.updated_at)}
        </p>
      </div>

      <Link
        href={`/forms/${form.id}/results`}
        className="w-28 text-right text-sm text-muted hover:text-brand"
      >
        {form.response_count} {responseLabel}
      </Link>

      <div className="relative">
        <button
          aria-label="More actions"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded px-2 py-1 text-xl leading-none text-muted hover:bg-line"
        >
          &hellip;
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-line bg-paper py-1 shadow-lg">
              <Link href={`/forms/${form.id}/edit`} className={menuItemClass}>
                Edit
              </Link>
              <Link href={`/forms/${form.id}/results`} className={menuItemClass}>
                View results
              </Link>
              <button className={menuItemClass} onClick={startRename}>
                Rename
              </button>
              <button className={menuItemClass} onClick={() => choose(onDuplicate)}>
                Duplicate
              </button>
              {isPublished && (
                <button className={menuItemClass} onClick={() => choose(onCopyLink)}>
                  Copy link
                </button>
              )}
              <button
                className={menuItemClass}
                onClick={() => choose(isPublished ? onUnpublish : onPublish)}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </button>
              <button className={`${menuItemClass} text-danger`} onClick={() => choose(onDelete)}>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
