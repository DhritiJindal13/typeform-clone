import type { QuestionSummary } from "@/lib/types";
import BarRow from "./BarRow";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function showNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "-" : String(value);
}

function SummaryBody({ summary }: { summary: QuestionSummary }) {
  if (summary.answered === 0) {
    return <p className="text-sm text-muted">No answers yet.</p>;
  }

  switch (summary.type) {
    case "multiple_choice":
    case "dropdown":
      return (
        <>
          {summary.choices?.map((choice) => (
            <BarRow
              key={choice.label}
              label={choice.label}
              count={choice.count}
              total={summary.answered}
            />
          ))}
        </>
      );

    case "yes_no":
      return (
        <>
          <BarRow label="Yes" count={summary.yes ?? 0} total={summary.answered} />
          <BarRow label="No" count={summary.no ?? 0} total={summary.answered} />
        </>
      );

    case "rating":
      return (
        <>
          <div className="mb-4 max-w-[10rem]">
            <Stat label="Average rating" value={showNumber(summary.average)} />
          </div>
          {summary.distribution?.map((item) => (
            <BarRow
              key={item.value}
              label={`${item.value} star${item.value === 1 ? "" : "s"}`}
              count={item.count}
              total={summary.answered}
            />
          ))}
        </>
      );

    case "number":
      return (
        <div className="grid max-w-md grid-cols-3 gap-3">
          <Stat label="Average" value={showNumber(summary.average)} />
          <Stat label="Smallest" value={showNumber(summary.min)} />
          <Stat label="Largest" value={showNumber(summary.max)} />
        </div>
      );

    default: {
      const shown = summary.recent?.length ?? 0;
      return (
        <>
          <ul className="flex flex-col gap-2">
            {summary.recent?.map((text, index) => (
              <li key={index} className="rounded bg-surface px-3 py-2 text-sm text-ink">
                {text}
              </li>
            ))}
          </ul>
          {summary.answered > shown && (
            <p className="mt-3 text-sm text-muted">
              Showing the latest {shown} of {summary.answered} answers. Open the Responses tab to
              see all of them.
            </p>
          )}
        </>
      );
    }
  }
}

export default function SummaryCard({ summary, number }: { summary: QuestionSummary; number: number }) {
  return (
    <section className="rounded-lg border border-line bg-paper p-6">
      <h3 className="text-base font-semibold text-ink">
        <span className="text-brand">{number}.</span> {summary.title}
      </h3>
      <p className="mb-5 mt-1 text-sm text-muted">
        {summary.answered} answered, {summary.skipped} skipped
      </p>
      <SummaryBody summary={summary} />
    </section>
  );
}
