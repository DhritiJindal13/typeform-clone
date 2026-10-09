"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError, errorMessage } from "@/lib/api";
import { validateAnswer } from "@/lib/validation";
import type { PublicForm } from "@/lib/types";
import { useToast } from "@/components/Toast";
import PageLoading from "@/components/PageLoading";
import QuestionScreen from "./QuestionScreen";
import FillFooter from "./FillFooter";
import ThankYouScreen from "./ThankYouScreen";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const AUTO_ADVANCE_DELAY = 300;

export default function FormFiller({ slug }: { slug: string }) {
  const toast = useToast();
  const isSending = useRef(false);

  const [form, setForm] = useState<PublicForm | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPublicForm(slug)
      .then(setForm)
      .catch(() => setNotAvailable(true));
  }, [slug]);

  const questions = form?.questions ?? [];
  const question = questions[index];
  const isLast = index === questions.length - 1;

  function setAnswer(questionId: number, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      const remaining = { ...current };
      delete remaining[questionId];
      return remaining;
    });
  }

  function showServerErrors(serverErrors: Record<string, string>) {
    const byQuestionId: Record<number, string> = {};
    for (const [id, message] of Object.entries(serverErrors)) {
      byQuestionId[Number(id)] = message;
    }
    setErrors(byQuestionId);

    const firstWithError = questions.findIndex((item) => byQuestionId[item.id]);
    if (firstWithError >= 0) {
      setDirection(firstWithError < index ? "back" : "forward");
      setIndex(firstWithError);
    }
  }

  async function submit(finalAnswers: Record<number, string>) {
    if (isSending.current) return;
    isSending.current = true;
    setIsSubmitting(true);

    const payload = questions
      .filter((item) => (finalAnswers[item.id] ?? "").trim() !== "")
      .map((item) => ({ question_id: item.id, value: finalAnswers[item.id].trim() }));

    try {
      const result = await api.submitResponse(slug, payload);
      setThankYouMessage(result.thank_you_message);
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        showServerErrors(error.errors);
      } else {
        toast(errorMessage(error), "error");
      }
    } finally {
      isSending.current = false;
      setIsSubmitting(false);
    }
  }

  function goNext(chosenValue?: string) {
    if (!question || isSubmitting) return;

    const value = chosenValue ?? answers[question.id] ?? "";
    const problem = validateAnswer(question, value);

    if (problem) {
      setErrors((current) => ({ ...current, [question.id]: problem }));
      return;
    }

    if (isLast) {
      submit({ ...answers, [question.id]: value });
      return;
    }

    setDirection("forward");
    setIndex(index + 1);
  }

  function goBack() {
    if (index === 0) return;
    setDirection("back");
    setIndex(index - 1);
  }

  function choose(value: string) {
    if (!question) return;
    setAnswer(question.id, value);
    setTimeout(() => goNext(value), AUTO_ADVANCE_DELAY);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!question || thankYouMessage !== null) return;

      const tag = (event.target as HTMLElement).tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === "ArrowDown" && tag !== "SELECT" && tag !== "TEXTAREA") {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === "ArrowUp" && tag !== "SELECT" && tag !== "TEXTAREA") {
        event.preventDefault();
        goBack();
        return;
      }

      if (isTyping || event.key.length !== 1) return;

      const key = event.key.toUpperCase();

      if (question.type === "multiple_choice") {
        const option = question.options[LETTERS.indexOf(key)];
        if (option) choose(option.label);
      }

      if (question.type === "yes_no") {
        if (key === "Y") choose("yes");
        if (key === "N") choose("no");
      }

      if (question.type === "rating") {
        const rating = Number(key);
        const max = question.settings?.max ?? 5;
        if (rating >= 1 && rating <= max) choose(String(rating));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  if (notAvailable || (form && questions.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-ink">
        <p className="text-xl font-semibold">This form is not available.</p>
        <p className="text-muted">It may have been unpublished or the link is wrong.</p>
        <Link href="/" className="text-brand hover:underline">
          Go to the home page
        </Link>
      </div>
    );
  }

  if (!form) return <PageLoading />;

  if (thankYouMessage !== null) return <ThankYouScreen message={thankYouMessage} />;

  const percent = Math.round((index / questions.length) * 100);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-ink">
      <main className="flex flex-1 items-center overflow-y-auto px-6">
        <div className="mx-auto w-full max-w-3xl py-10">
          <QuestionScreen
            key={question.id}
            question={question}
            number={index + 1}
            direction={direction}
            value={answers[question.id] ?? ""}
            error={errors[question.id]}
            isLast={isLast}
            isSubmitting={isSubmitting}
            onChange={(value) => setAnswer(question.id, value)}
            onChoose={choose}
            onNext={() => goNext()}
          />
        </div>
      </main>

      <FillFooter
        percent={percent}
        canGoBack={index > 0}
        onBack={goBack}
        onNext={() => goNext()}
      />
    </div>
  );
}
