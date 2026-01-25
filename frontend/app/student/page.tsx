"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";

type AssignmentRow = {
  id: string;
  case_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  title: string;
  category: string;
  lawyer_name: string;
};

export function LawStudentDashboardContent() {
  const { currentUser, logout } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState<AssignmentRow[]>([]);
  const [acceptedAssignments, setAcceptedAssignments] = useState<AssignmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      const response = await fetch("/api/student/assignments");
      if (response.ok) {
        const data = (await response.json()) as { assignments: AssignmentRow[] };
        const pending = (data.assignments ?? []).filter((item) => item.status === "pending");
        const accepted = (data.assignments ?? []).filter((item) => item.status === "accepted");
        setPendingAssignments(pending);
        setAcceptedAssignments(accepted);
      }
    };
    loadAssignments();
  }, []);

  const handleUpdate = async (id: string, action: "accept" | "reject") => {
    setError(null);
    const response = await fetch(`/api/student/assignments/${id}/${action}`, { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to update assignment");
      return;
    }
    const data = (await response.json()) as { assignment: AssignmentRow };
    if (action === "accept") {
      setPendingAssignments((prev) => prev.filter((item) => item.id !== id));
      setAcceptedAssignments((prev) => [data.assignment, ...prev]);
    } else {
      setPendingAssignments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">
            Law Student Desk
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Welcome, {currentUser?.email ?? "Student"}
          </h1>
          <p className="text-sm text-slate-400">
            Review assignments from lawyers and accept to join a case.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
          >
            Logout
          </button>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            Back to landing
          </Link>
        </div>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Pending assignments</h2>
          <span className="text-xs text-slate-500">{pendingAssignments.length} pending</span>
        </div>
        {pendingAssignments.length ? (
          <div className="grid gap-3">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{assignment.title}</p>
                    <p className="text-slate-400">
                      {assignment.category} · Lawyer: {assignment.lawyer_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(assignment.id, "accept")}
                      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-400"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdate(assignment.id, "reject")}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No pending assignments.</p>
        )}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Accepted assignments</h2>
          <span className="text-xs text-slate-500">{acceptedAssignments.length} accepted</span>
        </div>
        {acceptedAssignments.length ? (
          <div className="grid gap-3">
            {acceptedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm"
              >
                <p className="font-semibold text-white">{assignment.title}</p>
                <p className="text-slate-400">
                  {assignment.category} · Lawyer: {assignment.lawyer_name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No accepted assignments yet.</p>
        )}
      </section>
    </main>
  );
}

export default function LawStudentDashboardPage() {
  return (
    <ProtectedRoute allowedRole="student">
      <LawStudentDashboardContent />
    </ProtectedRoute>
  );
}
