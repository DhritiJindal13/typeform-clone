interface BarRowProps {
  label: string;
  count: number;
  total: number;
}

export default function BarRow({ label, count, total }: BarRowProps) {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm text-ink">
        <span>{label}</span>
        <span className="text-muted">
          {count} ({percent}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
