"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import * as authApi from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clear();
    router.push("/login");
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex justify-between items-center px-lg h-16 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-headline-md font-bold text-primary">
          ResumeForge
        </span>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      <main className="grow flex flex-col items-center justify-center gap-sm text-center p-xl">
        <h1 className="text-headline-lg text-on-surface">
          Welcome{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-md">
          You&apos;re signed in. The dashboard, template gallery, and CV editor
          are next up.
        </p>
      </main>
    </div>
  );
}
