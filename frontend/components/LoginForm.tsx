"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthRole, AuthUser, useAuth } from "../lib/auth";

type LoginFormProps = {
  role: AuthRole;
  title: string;
  subtitle: string;
};

const dashboardMap: Record<AuthRole, string> = {
  client: "/dashboard/client",
  lawyer: "/dashboard/lawyer",
  student: "/dashboard/student",
};

export default function LoginForm({ role, title, subtitle }: LoginFormProps) {
  const router = useRouter();
  const { currentUser, setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formValues, setFormValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const destination = useMemo(() => dashboardMap[role], [role]);

  useEffect(() => {
    // Only auto-redirect if the logged-in role matches this login page.
    if (currentUser && currentUser.role === role) {
      router.push(destination);
    }
  }, [currentUser, destination, role, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
      role,
    };

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Authentication failed");
      return;
    }

    const data = (await response.json()) as { user: AuthUser };
    setUser(data.user);
    router.push(destination);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Role Login</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Name</label>
          <input
            required={mode === "signup"}
            value={formValues.name}
            onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            placeholder="Your full name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Email</label>
          <input
            required
            type="email"
            value={formValues.email}
            onChange={(event) => setFormValues({ ...formValues, email: event.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Password</label>
          <input
            required
            type="password"
            value={formValues.password}
            onChange={(event) => setFormValues({ ...formValues, password: event.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            placeholder="Enter a demo password"
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          {mode === "signup" ? "Create account" : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="text-left text-xs text-slate-400 hover:text-slate-200"
        >
          {mode === "signup" ? "Already have an account? Login" : "New here? Create account"}
        </button>
      </form>

      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        Back to landing
      </Link>
    </main>
  );
}
