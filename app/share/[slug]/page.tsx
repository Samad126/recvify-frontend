import type { Metadata } from "next";
import { ResumeDocument } from "@/components/editor/resume-document";
import { getPublicCv } from "@/lib/api/public-cvs";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const cv = await getPublicCv(slug);
    return { title: `${cv.title} - ResumeForge` };
  } catch {
    return { title: "Resume not found - ResumeForge" };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;

  let cv: Awaited<ReturnType<typeof getPublicCv>>;
  try {
    cv = await getPublicCv(slug);
  } catch {
    return (
      <div className="min-h-full flex items-center justify-center p-xl text-center">
        <p className="text-body-md text-on-surface-variant">
          This resume link is invalid, or the CV is no longer shared.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center bg-surface-container p-md md:p-xl">
      <ResumeDocument
        contactInfoJson={cv.contactInfoJson}
        sections={cv.sections}
        styleOverridesJson={cv.styleOverridesJson}
        template={cv.template}
      />
    </div>
  );
}
