interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-ink">{title}</h2>
        <p className="mb-6 text-sm text-muted">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
