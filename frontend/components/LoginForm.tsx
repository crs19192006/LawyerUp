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
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    contactNumber: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
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

    if (role === "client" && mode === "signup" && !certificateFile) {
      setError("Please upload your BPL/SC/ST certificate PDF before continuing.");
      return;
    }

    if (role === "student" && !formValues.college.trim()) {
      setError("Please enter your college name before continuing.");
      return;
    }

    let certificateUrl: string | null = null;
    if (role === "client" && mode === "signup" && certificateFile) {
      const formData = new FormData();
      formData.append("file", certificateFile);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        const data = (await uploadResponse.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Unable to upload certificate");
        return;
      }
      const data = (await uploadResponse.json()) as { url: string };
      certificateUrl = data.url;
    }

    const payload = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
      role,
      certificateUrl,
      college: formValues.college,
      contactNumber: formValues.contactNumber,
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
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Role Login</p>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-500">Name</label>
          <input
            required={mode === "signup"}
            value={formValues.name}
            onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Your full name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
          <input
            required
            type="email"
            value={formValues.email}
            onChange={(event) => setFormValues({ ...formValues, email: event.target.value })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-500">Password</label>
          <input
            required
            type="password"
            value={formValues.password}
            onChange={(event) => setFormValues({ ...formValues, password: event.target.value })}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Enter a demo password"
          />
        </div>
        {role === "student" ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">College</label>
            <input
              required
              value={formValues.college}
              onChange={(event) => setFormValues({ ...formValues, college: event.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Your college name"
            />
          </div>
        ) : null}
        {role === "lawyer" ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">Contact number</label>
            <input
              required={mode === "login"}
              value={formValues.contactNumber}
              onChange={(event) =>
                setFormValues({ ...formValues, contactNumber: event.target.value })
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="10-digit phone number"
            />
          </div>
        ) : null}
        {role === "client" && mode === "signup" ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">
              Upload BPL/SC/ST Certificate (PDF)
            </label>
            <input
              required
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setCertificateFile(file);
              }}
              className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            />
            <p className="text-xs text-slate-500">
              This document is required to verify eligibility.
            </p>
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {mode === "signup" ? "Create account" : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="text-left text-xs text-slate-500 hover:text-slate-700"
        >
          {mode === "signup" ? "Already have an account? Login" : "New here? Create account"}
        </button>
      </form>

      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
        Back to landing
      </Link>
    </main>
  );
}
