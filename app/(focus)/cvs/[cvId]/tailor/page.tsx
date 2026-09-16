import { TailorToJob } from "@/components/editor/tailor-to-job";

export default async function TailorToJobPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const { cvId } = await params;
  return <TailorToJob cvId={cvId} />;
}
