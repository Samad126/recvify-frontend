import { Sidebar } from "@/components/app/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <nav className="md:hidden fixed top-0 inset-x-0 z-50 flex justify-between items-center px-lg h-16 bg-surface border-b border-outline-variant">
        <span className="text-headline-md font-bold text-primary">
          ResumeForge
        </span>
      </nav>
      <Sidebar />
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 p-md md:p-xl flex flex-col min-h-full">
        {children}
      </main>
    </div>
  );
}
