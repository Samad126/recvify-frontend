import { CvEditor } from "@/components/editor/cv-editor";

export default async function CvEditorPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const { cvId } = await params;
  return <CvEditor cvId={cvId} />;
}
