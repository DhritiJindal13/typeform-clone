interface FillFooterProps {
  percent: number;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
}

function Chevron({ pointsUp }: { pointsUp: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points={pointsUp ? "3,10 8,5 13,10" : "3,6 8,11 13,6"} />
    </svg>
  );
}

export default function FillFooter({ percent, canGoBack, onBack, onNext }: FillFooterProps) {
  return (
    <footer className="flex items-center justify-between px-6 py-4">
      <div className="w-56">
        <p className="mb-1.5 text-sm text-ink">{percent}% completed</p>
        <div className="h-1.5 rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex overflow-hidden rounded bg-brand text-white shadow">
        <button
          aria-label="Previous question"
          onClick={onBack}
          disabled={!canGoBack}
          className="px-3 py-2.5 hover:bg-brand-dark disabled:opacity-40"
        >
          <Chevron pointsUp />
        </button>
        <button
          aria-label="Next question"
          onClick={onNext}
          className="border-l border-white/30 px-3 py-2.5 hover:bg-brand-dark"
        >
          <Chevron pointsUp={false} />
        </button>
      </div>
    </footer>
  );
}
