import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const features = [
  {
    icon: "dashboard_customize",
    title: "Professional Templates",
    body: "Choose from a curated library of ATS-friendly designs. Structured for readability and impact, ensuring your core skills stand out immediately to hiring managers.",
  },
  {
    icon: "auto_awesome",
    title: "AI Content Improvement",
    body: "Our specialized models refine your bullet points, suggesting stronger action verbs and quantifiable metrics to elevate your experience from average to exceptional.",
  },
  {
    icon: "description",
    title: "Tailor to Job Descriptions",
    body: "Paste a job description and instantly generate a customized version of your CV that aligns perfectly with the required skills and keywords.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-lg h-16 max-w-300 mx-auto w-full bg-surface border-b border-outline-variant">
        <span className="text-headline-md font-bold text-primary">
          ResumeForge
        </span>
        <div className="flex items-center gap-sm">
          <Link
            href="/login"
            className="hidden md:block text-label-md text-secondary border border-outline-variant px-md py-sm rounded-lg hover:bg-surface-container-low bg-surface-container-lowest transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-label-md bg-primary-container text-on-primary font-semibold px-md py-sm rounded-lg hover:bg-primary transition-colors"
          >
            Create Resume
          </Link>
        </div>
      </header>

      <main className="grow pt-20 pb-xl flex flex-col items-center">
        <section className="w-full max-w-300 mx-auto px-md md:px-xl py-xl md:py-20 flex flex-col items-center text-center">
          <h1 className="text-headline-xl-mobile md:text-headline-xl text-on-surface mb-md max-w-3xl">
            Build a CV that gets you hired, faster — with AI
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-lg max-w-2xl">
            Create professional resumes effortlessly. Our AI analyzes job
            descriptions and tailors your experience to highlight exactly what
            recruiters are looking for. No fluff, just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center w-full sm:w-auto">
            <Link
              href="/sign-up"
              className="bg-primary-container text-on-primary text-label-md px-lg py-md rounded-lg hover:bg-primary transition-colors shadow-flat-soft"
            >
              Get started free
            </Link>
            <Link
              href="/sign-up"
              className="bg-surface-container-lowest text-secondary border border-outline-variant text-label-md px-lg py-md rounded-lg hover:bg-surface-container-low transition-colors shadow-flat-soft"
            >
              See templates
            </Link>
          </div>
        </section>

        <section className="w-full max-w-300 mx-auto px-md md:px-xl py-xl border-t border-outline-variant mt-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex flex-col gap-sm hover:border-primary-container transition-colors shadow-flat-soft"
              >
                <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary-container mb-sm border border-outline-variant">
                  <Icon name={feature.icon} filled />
                </div>
                <h3 className="text-headline-md text-on-surface">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-lg px-xl flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest border-t border-outline-variant mt-auto">
        <div className="text-label-md font-bold text-on-surface">
          © {new Date().getFullYear()} ResumeForge AI. All rights reserved.
        </div>
        <div className="flex gap-md text-body-sm text-on-surface-variant">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Support</span>
        </div>
      </footer>
    </div>
  );
}
