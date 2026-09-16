export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex items-center justify-center p-md bg-surface">
      <main className="w-full max-w-100">
        <div className="text-center mb-lg">
          <h1 className="text-headline-xl text-primary font-bold">
            ResumeForge
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
}
