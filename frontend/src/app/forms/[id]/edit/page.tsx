import { Suspense } from "react";
import BuilderEditor from "@/components/BuilderEditor";
import PageLoading from "@/components/PageLoading";

export default function BuilderPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <BuilderEditor />
    </Suspense>
  );
}
