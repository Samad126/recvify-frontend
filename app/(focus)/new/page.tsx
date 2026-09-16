import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const options = [
  {
    href: "/templates",
    icon: "description",
    title: "Create a new CV",
    subtitle: "Start from a professional template",
  },
  {
    href: "/upload",
    icon: "upload_file",
    title: "Improve my existing CV",
    subtitle: "Upload a file and let AI polish it",
  },
];

export default function OnboardingPathSelectorPage() {
  return (
    <div className="min-h-full flex items-center justify-center p-md md:p-xl bg-surface text-on-surface">
      <main className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant p-lg md:p-xl shadow-flat-soft flex flex-col gap-xl">
        <div className="text-center space-y-sm">
          <h1 className="text-headline-xl-mobile md:text-headline-xl text-on-surface">
            What would you like to do?
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Select an option below to get started with ResumeForge.
          </p>
        </div>

        <div className="flex flex-col gap-md">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group relative w-full text-left bg-surface-bright border border-outline-variant rounded-lg p-md flex items-start gap-md transition-all duration-200 hover:border-primary-container hover:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface transition-colors group-hover:bg-primary-container group-hover:text-on-primary">
                <Icon name={option.icon} />
              </div>
              <div className="flex flex-col gap-xs pt-1">
                <h2 className="text-headline-md text-on-surface">
                  {option.title}
                </h2>
                <p className="text-body-sm text-on-surface-variant">
                  {option.subtitle}
                </p>
              </div>
            </Link>
          ))}

          <div
            title="Tailor an existing CV from its own editor page"
            className="relative w-full text-left bg-surface-bright border border-outline-variant rounded-lg p-md flex items-start gap-md opacity-50 cursor-not-allowed"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <Icon name="track_changes" />
            </div>
            <div className="flex flex-col gap-xs pt-1">
              <h2 className="text-headline-md text-on-surface">
                Tailor my CV to a job
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Open an existing resume first, then tailor it to a job
                description
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-md border-t border-outline-variant">
          <Link
            href="/dashboard"
            className="text-label-md text-on-surface-variant hover:text-primary-container transition-colors inline-block p-sm focus:outline-none focus:ring-2 focus:ring-primary-container rounded"
          >
            Skip for now
          </Link>
        </div>
      </main>
    </div>
  );
}
