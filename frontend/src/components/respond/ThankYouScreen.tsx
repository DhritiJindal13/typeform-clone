import Link from "next/link";

export default function ThankYouScreen({ message }: { message: string }) {
  return (
    <div className="screen-forward flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="mb-4 max-w-2xl text-4xl font-medium text-ink">{message}</h1>
      <p className="mb-8 text-lg text-muted">Your response has been recorded.</p>
      <Link
        href="/"
        className="rounded bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark"
      >
        Create your own typeform
      </Link>
    </div>
  );
}
