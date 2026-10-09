import { Suspense } from "react";
import ResultsView from "@/components/results/ResultsView";
import PageLoading from "@/components/PageLoading";

export default function ResultsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResultsView />
    </Suspense>
  );
}
