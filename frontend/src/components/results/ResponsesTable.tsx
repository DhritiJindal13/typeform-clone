import { formatDateTime } from "@/lib/format";
import type { Question, ResponseRow } from "@/lib/types";

interface ResponsesTableProps {
  questions: Question[];
  responses: ResponseRow[];
  onOpen: (responseId: number) => void;
}

export default function ResponsesTable({ questions, responses, onOpen }: ResponsesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-paper">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">Submitted</th>
            {questions.map((question) => (
              <th key={question.id} className="max-w-[12rem] truncate px-4 py-3 font-semibold">
                {question.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {responses.map((response) => (
            <tr
              key={response.id}
              onClick={() => onOpen(response.id)}
              className="cursor-pointer hover:bg-surface"
            >
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                {formatDateTime(response.submitted_at)}
              </td>
              {questions.map((question) => (
                <td key={question.id} className="max-w-[12rem] truncate px-4 py-3 text-ink">
                  {response.answers[String(question.id)] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
