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
  const [newTitle, setNewTitle] = useState(form.title);

  const isPublished = form.status === "published";
  const responseLabel = form.response_count === 1 ? "response" : "responses";

  function startRename() {
    setMenuOpen(false);
    setNewTitle(form.title);
    setIsRenaming(true);
  }

  function saveRename() {
    const title = newTitle.trim();
    setIsRenaming(false);
    if (title && title !== form.title) onRename(title);
  }

  function chooseFromMenu(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <li className="flex items-center gap-4 px-5 py-4 hover:bg-surface">
      <div className="min-w-0 flex-1">
        {isRenaming ? (
          <input
            autoFocus
            value={newTitle}
            maxLength={200}
            onChange={(event) => setNewTitle(event.target.value)}
            onBlur={() => setIsRenaming(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveRename();
              if (event.key === "Escape") setIsRenaming(false);
            }}
            className="w-full rounded border border-brand bg-paper px-2 py-1 text-base font-medium text-ink outline-none"
          />
        ) : (
          <Link
            href={`/forms/${form.id}/edit`}
            className="block truncate text-base font-semibold text-ink hover:text-brand"
          >
            {form.title}
          </Link>
        )}
        <p className="mt-0.5 text-sm text-muted">Updated {timeAgo(form.updated_at)}</p>
      </div>

      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          isPublished ? "bg-success-soft text-success" : "bg-surface text-muted"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </span>

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
          ...
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
              <button className={menuItemClass} onClick={() => chooseFromMenu(onDuplicate)}>
                Duplicate
              </button>
              {isPublished && (
                <button className={menuItemClass} onClick={() => chooseFromMenu(onCopyLink)}>
                  Copy link
                </button>
              )}
              {isPublished ? (
                <button className={menuItemClass} onClick={() => chooseFromMenu(onUnpublish)}>
                  Unpublish
                </button>
              ) : (
                <button className={menuItemClass} onClick={() => chooseFromMenu(onPublish)}>
                  Publish
                </button>
              )}
              <button
                className={`${menuItemClass} text-danger`}
                onClick={() => chooseFromMenu(onDelete)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
