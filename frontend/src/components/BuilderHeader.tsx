"use client";

import { useState } from "react";
import Link from "next/link";
import type { FormDetail } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

interface BuilderHeaderProps {
  form: FormDetail;
  onRename: (title: string) => void;
  onTogglePublish: () => void;
  onCopyLink: () => void;
}

const tabBase = "flex h-full items-center border-b-2 px-4 text-sm font-medium transition-colors";
const tabIdle = `${tabBase} border-transparent text-white/70 hover:text-white`;
const tabActive = `${tabBase} border-white text-white`;

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
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-chrome px-4 text-white">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          aria-label="Back to workspace"
          className="rounded px-2 py-1 text-lg text-white/80 hover:bg-white/10 hover:text-white"
        >
          &larr;
        </Link>
        <input
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="w-56 min-w-0 rounded bg-transparent px-2 py-1 text-base font-semibold text-white outline-none hover:bg-white/10 focus:bg-white/10"
        />
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPublished ? "bg-success-soft text-success" : "bg-white/15 text-white/80"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <nav className="flex h-full items-stretch">
        <span className={tabActive}>Create</span>
        <button
          onClick={onCopyLink}
          disabled={!isPublished}
          title={isPublished ? "Copy the public link" : "Publish the form to share it"}
          className={`${tabIdle} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/70`}
        >
          Share
        </button>
        <Link href={`/forms/${form.id}/results`} className={tabIdle}>
          Results
        </Link>
      </nav>

      <div className="flex items-center justify-end gap-2">
        <ThemeToggle className="rounded p-2 text-white/80 hover:bg-white/10 hover:text-white" />
        <button
          onClick={onTogglePublish}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold ${
            isPublished
              ? "bg-white/15 text-white hover:bg-white/25"
              : "bg-[#ffffff] text-[#262627] hover:bg-white/90"
          }`}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>
    </header>
  );
}
