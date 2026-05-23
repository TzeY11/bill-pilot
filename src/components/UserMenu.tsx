"use client";

import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setUser(payload?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-300">
          <UserRound size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name || "Account"}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <button type="button" onClick={logout} className="btn-secondary mt-3 w-full">
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
