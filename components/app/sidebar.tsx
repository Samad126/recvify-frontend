"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  icon: string;
  href?: string;
}

const navItems: NavItem[] = [
  { label: "My Resumes", icon: "description", href: "/dashboard" },
  { label: "Templates", icon: "dashboard_customize" },
  { label: "AI Credits", icon: "auto_awesome" },
  { label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col p-md z-40 bg-surface border-r border-outline-variant">
      <div className="mb-xl flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
          R
        </div>
        <span className="text-headline-lg text-primary font-bold">
          ResumeForge
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-sm">
        {navItems.map((item) => {
          const isActive = item.href && pathname.startsWith(item.href);
          if (!item.href) {
            return (
              <button
                key={item.label}
                type="button"
                disabled
                title="Coming soon"
                className="flex items-center gap-md px-md py-sm text-on-surface-variant/50 rounded-lg text-label-md cursor-not-allowed text-left"
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-md px-md py-sm rounded-lg text-label-md transition-colors",
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon name={item.icon} filled={!!isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-lg border-t border-outline-variant flex items-center gap-md">
        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold border border-outline-variant">
          {user?.firstName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-label-md text-on-surface truncate">
            {user ? `${user.firstName} ${user.lastName}` : "…"}
          </span>
          <span className="text-body-sm text-on-surface-variant">
            {user?.plan === "PRO" ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
      </div>
    </aside>
  );
}
