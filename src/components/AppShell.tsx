"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, UserRound } from "lucide-react";
import clsx from "clsx";
import { ThemeIconToggle, ThemeSelect } from "./ThemeControl";
import { UserMenu } from "./UserMenu";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: CreditCard },
  { href: "/account", label: "Account", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-mist text-ink transition-colors">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white/90 px-5 py-6 backdrop-blur transition-colors dark:bg-slate-950/90 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white shadow-soft">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold">Bill Pilot</p>
            <p className="text-xs text-slate-500">Renewal command center</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 space-y-4">
          <UserMenu />
          <ThemeSelect />
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-3 backdrop-blur transition-colors dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <BarChart3 size={18} />
            </span>
            Bill Pilot
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={clsx(
                    "rounded-lg p-2",
                    active
                      ? "bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <Icon size={20} />
                </Link>
              );
            })}
            <ThemeIconToggle />
          </nav>
        </div>
      </header>

      <main className="px-4 py-6 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
