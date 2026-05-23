"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { BarChart3 } from "lucide-react";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const nextPath = searchParams.get("next") || "/";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Something went wrong.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-10 text-ink dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-soft">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white shadow-soft">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Bill Pilot</h1>
            <p className="text-sm text-slate-500">
              {isRegister ? "Create your account" : "Sign in to your workspace"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <label>
              <span className="form-label">Name</span>
              <input
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            <span className="form-label">Email</span>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            <span className="form-label">Password</span>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-danger dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "New to Bill Pilot?"}{" "}
          <Link
            className="font-semibold text-brand hover:text-blue-700"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}
