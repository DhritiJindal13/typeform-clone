import { Suspense } from "react";
import FormFiller from "@/components/respond/FormFiller";
import PageLoading from "@/components/PageLoading";

type PageProps = { params: Promise<{ slug: string }> };

// The await lives in a child so the page shell can prerender
// while the slug is resolved inside the Suspense boundary.
async function FormLoader({ params }: PageProps) {
  const { slug } = await params;
  return <FormFiller slug={slug} />;
}

export default function PublicFormPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <FormLoader params={params} />
    </Suspense>
  );
}
