import { Suspense } from "react";
import FormFiller from "@/components/respond/FormFiller";
import PageLoading from "@/components/PageLoading";

type PageProps = { params: Promise<{ slug: string }> };

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
