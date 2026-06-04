"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const getFileName = (url: string) => url.split("/").pop() ?? url;

type AssignmentRow = {
  id: string;
  case_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  title: string;
  category: string;
  lawyer_name: string;
};

type CaseRow = {
  id: string;
  client_id: string;
  assigned_lawyer_id: string | null;
  title: string;
  description: string;
  category: string;
  difficulty_score: number;
  complexity_tag: string;
  status: string;
  status_note?: string | null;
  next_hearing_at?: string | null;
  created_at: string;
};

type CaseDocumentRow = {
  id: string;
  case_id: string;
  uploaded_by: string;
  file_url: string;
  created_at: string;
};

type PersonRow = {
  id: string;
  name: string;
  email?: string;
  bpl_certificate_url?: string | null;
};

type CaseDetail = {
  case: CaseRow;
  client: PersonRow | null;
  documents: CaseDocumentRow[];
  lawyer: PersonRow | null;
};

function LawStudentDashboardContent() {
  const { currentUser, logout } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState<AssignmentRow[]>([]);
  const [acceptedAssignments, setAcceptedAssignments] = useState<AssignmentRow[]>([]);
  const [caseDetails, setCaseDetails] = useState<Record<string, CaseDetail>>({});
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

        const allAssignments = [...pending, ...accepted];
        if (allAssignments.length) {
          const updates: Record<string, CaseDetail> = {};
          await Promise.all(
            allAssignments.map(async (assignment) => {
              const response = await fetch(`/api/cases/${assignment.case_id}`);
              if (response.ok) {
                const detail = (await response.json()) as CaseDetail;
                updates[assignment.case_id] = detail;
              }
            })
          );
          if (Object.keys(updates).length) {
            setCaseDetails((prev) => ({ ...prev, ...updates }));
          }
        }
      }
    };
    loadAssignments();
  }, []);

  const handleUpdate = async (id: string, action: "accept" | "reject") => {
    setError(null);
    const existing = pendingAssignments.find((item) => item.id === id);
    const response = await fetch(`/api/student/assignments/${id}/${action}`, { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to update assignment");
      return;
    }
    if (action === "accept") {
      setPendingAssignments((prev) => prev.filter((item) => item.id !== id));
      if (existing) {
        setAcceptedAssignments((prev) => [{ ...existing, status: "accepted" }, ...prev]);
      }
    } else {
      setPendingAssignments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">
            Law Student Desk
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome, {currentUser?.email ?? "Student"}
          </h1>
          <p className="text-sm text-slate-600">
            Review assignments from lawyers and accept to join a case.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
          >
            Logout
          </button>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
            Back to landing
          </Link>
        </div>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Pending assignments</h2>
          <span className="text-xs text-slate-500">{pendingAssignments.length} pending</span>
        </div>
        {pendingAssignments.length ? (
          <div className="grid gap-3">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {caseDetails[assignment.case_id]?.case.title ?? assignment.title}
                    </p>
                    <p className="text-slate-600">
                      {caseDetails[assignment.case_id]?.case.category ?? assignment.category} ·
                      Lawyer: {caseDetails[assignment.case_id]?.lawyer?.name ?? assignment.lawyer_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(assignment.id, "accept")}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdate(assignment.id, "reject")}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {caseDetails[assignment.case_id] ? (
                  <div className="mt-4 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-700">Case details</p>
                      <p className="mt-2">{caseDetails[assignment.case_id].case.description}</p>
                      <p className="mt-2">
                        Status: {caseDetails[assignment.case_id].case.status} · Score{" "}
                        {caseDetails[assignment.case_id].case.difficulty_score} ·{" "}
                        {caseDetails[assignment.case_id].case.complexity_tag}
                      </p>
                      <p className="mt-2">
                        Current status: {caseDetails[assignment.case_id].case.status_note ?? "Awaiting update"}
                      </p>
                      <p className="mt-1">
                        Next hearing: {caseDetails[assignment.case_id].case.next_hearing_at ? formatDate(caseDetails[assignment.case_id].case.next_hearing_at ?? "") : "Not scheduled"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-700">Client info</p>
                      <p className="mt-2">
                        {caseDetails[assignment.case_id].client?.name ?? "Client"} ·{" "}
                        {caseDetails[assignment.case_id].client?.email ?? ""}
                      </p>
                      {caseDetails[assignment.case_id].client?.bpl_certificate_url ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span>BPL/SC/ST certificate:</span>
                          <a
                            href={caseDetails[assignment.case_id].client?.bpl_certificate_url ?? ""}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            View
                          </a>
                          <a
                            href={caseDetails[assignment.case_id].client?.bpl_certificate_url ?? ""}
                            download
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="mt-2 text-slate-500">BPL/SC/ST certificate: Not provided</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
                      <p className="font-semibold text-slate-700">Documents</p>
                      <ul className="mt-2 space-y-2">
                        {caseDetails[assignment.case_id].documents.length ? (
                          caseDetails[assignment.case_id].documents.map((doc) => (
                            <li key={doc.id} className="flex flex-wrap items-center gap-2">
                              <span>{getFileName(doc.file_url)}</span>
                              <span className="text-slate-400">·</span>
                              <span>{formatDate(doc.created_at)}</span>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                              >
                                View
                              </a>
                              <a
                                href={doc.file_url}
                                download
                                className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                              >
                                Download
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>No documents yet</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No pending assignments.</p>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Accepted assignments</h2>
          <span className="text-xs text-slate-500">{acceptedAssignments.length} accepted</span>
        </div>
        {acceptedAssignments.length ? (
          <div className="grid gap-3">
            {acceptedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {caseDetails[assignment.case_id]?.case.title ?? assignment.title}
                </p>
                <p className="text-slate-600">
                  {caseDetails[assignment.case_id]?.case.category ?? assignment.category} · Lawyer:{" "}
                  {caseDetails[assignment.case_id]?.lawyer?.name ?? assignment.lawyer_name}
                </p>
                {caseDetails[assignment.case_id] ? (
                  <div className="mt-4 grid gap-3 text-xs text-slate-600 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-700">Case details</p>
                      <p className="mt-2">{caseDetails[assignment.case_id].case.description}</p>
                      <p className="mt-2">
                        Status: {caseDetails[assignment.case_id].case.status} · Score{" "}
                        {caseDetails[assignment.case_id].case.difficulty_score} ·{" "}
                        {caseDetails[assignment.case_id].case.complexity_tag}
                      </p>
                      <p className="mt-2">
                        Current status: {caseDetails[assignment.case_id].case.status_note ?? "Awaiting update"}
                      </p>
                      <p className="mt-1">
                        Next hearing: {caseDetails[assignment.case_id].case.next_hearing_at ? formatDate(caseDetails[assignment.case_id].case.next_hearing_at ?? "") : "Not scheduled"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-700">Client info</p>
                      <p className="mt-2">
                        {caseDetails[assignment.case_id].client?.name ?? "Client"} ·{" "}
                        {caseDetails[assignment.case_id].client?.email ?? ""}
                      </p>
                      {caseDetails[assignment.case_id].client?.bpl_certificate_url ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span>BPL/SC/ST certificate:</span>
                          <a
                            href={caseDetails[assignment.case_id].client?.bpl_certificate_url ?? ""}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            View
                          </a>
                          <a
                            href={caseDetails[assignment.case_id].client?.bpl_certificate_url ?? ""}
                            download
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="mt-2 text-slate-500">BPL/SC/ST certificate: Not provided</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
                      <p className="font-semibold text-slate-700">Documents</p>
                      <ul className="mt-2 space-y-2">
                        {caseDetails[assignment.case_id].documents.length ? (
                          caseDetails[assignment.case_id].documents.map((doc) => (
                            <li key={doc.id} className="flex flex-wrap items-center gap-2">
                              <span>{getFileName(doc.file_url)}</span>
                              <span className="text-slate-400">·</span>
                              <span>{formatDate(doc.created_at)}</span>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                              >
                                View
                              </a>
                              <a
                                href={doc.file_url}
                                download
                                className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                              >
                                Download
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>No documents yet</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No accepted assignments yet.</p>
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
