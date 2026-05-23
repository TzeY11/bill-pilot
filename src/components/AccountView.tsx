"use client";

import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

export function AccountView() {
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-brand">
          User management
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Account</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Manage your local Bill Pilot account and session.
        </p>
      </div>

      <section className="max-w-2xl rounded-lg border border-line bg-panel p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-300">
            <UserRound size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{user?.name || "Account"}</h2>
            <p className="mt-1 text-sm text-slate-500">{user?.email ?? "Loading..."}</p>
            <p className="mt-4 text-sm text-slate-500">
              Service data is still stored in this browser for now. The next backend step is
              moving services from localStorage into the database and linking them to this user.
            </p>
          </div>
        </div>

        <button type="button" onClick={logout} className="btn-secondary mt-6">
          <LogOut size={16} />
          Sign Out
        </button>
      </section>
    </div>
  );
}
