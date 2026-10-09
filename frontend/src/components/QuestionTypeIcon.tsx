import type { QuestionType } from "@/lib/types";

// Each type gets its own color, like Typeform's question badges.
const BADGE_COLORS: Record<QuestionType, string> = {
  short_text: "bg-[#e8effb] text-[#0445af]",
  long_text: "bg-[#e8effb] text-[#0445af]",
  multiple_choice: "bg-[#f3e8fb] text-[#7a2fb5]",
  dropdown: "bg-[#f3e8fb] text-[#7a2fb5]",
  email: "bg-[#e3f4ea] text-[#1b7f4b]",
  number: "bg-[#fdf0e1] text-[#b85c00]",
  yes_no: "bg-[#fde8e8] text-[#c62828]",
  rating: "bg-[#fff6d6] text-[#a37400]",
};

function Glyph({ type }: { type: QuestionType }) {
  switch (type) {
    case "short_text":
      return <path d="M3 8h10" />;
    case "long_text":
      return <path d="M3 4.5h10M3 8h10M3 11.5h6" />;
    case "multiple_choice":
      return (
        <>
          <circle cx="3.5" cy="4.5" r="1" />
          <circle cx="3.5" cy="8" r="1" />
          <circle cx="3.5" cy="11.5" r="1" />
          <path d="M7 4.5h6M7 8h6M7 11.5h6" />
        </>
      );
    case "dropdown":
      return (
        <>
          <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
          <polyline points="5.5,7 8,9.5 10.5,7" />
        </>
      );
    case "email":
      return (
        <>
          <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
          <polyline points="2.5,4.5 8,9 13.5,4.5" />
        </>
      );
    case "number":
      return <path d="M6 2.5 5 13.5M11 2.5 10 13.5M3 6h10.5M2.5 10h10.5" />;
    case "yes_no":
      return <polyline points="3,8.5 6.5,12 13,4.5" />;
    case "rating":
      return (
        <polygon points="8,1.8 10,6 14.5,6.5 11.1,9.5 12.1,14 8,11.7 3.9,14 4.9,9.5 1.5,6.5 6,6" />
      );
  }
}

export default function QuestionTypeIcon({ type }: { type: QuestionType }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${BADGE_COLORS[type]}`}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <Glyph type={type} />
      </svg>
    </span>
  );
}
