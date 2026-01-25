"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

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
  created_at: string;
};

type CaseDocumentRow = {
  id: string;
  case_id: string;
  uploaded_by: string;
  file_url: string;
  created_at: string;
};

type StudentOption = {
  id: string;
  name: string;
  email: string;
};

type AssignmentRow = {
  id: string;
  case_id: string;
  student_id: string;
  status: "pending" | "accepted" | "rejected";
};

export function LawyerDashboardContent() {
  const { currentUser, logout } = useAuth();
  const [openCases, setOpenCases] = useState<CaseRow[]>([]);
  const [myCases, setMyCases] = useState<CaseRow[]>([]);
  const [documentsByCase, setDocumentsByCase] = useState<Record<string, CaseDocumentRow[]>>({});
  const [assignmentsByCase, setAssignmentsByCase] = useState<Record<string, AssignmentRow[]>>({});
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      const response = await fetch("/api/cases");
      if (response.ok) {
        const data = (await response.json()) as {
          openCases: CaseRow[];
          myCases: CaseRow[];
        };
        setOpenCases(data.openCases ?? []);
        setMyCases(data.myCases ?? []);
      }
    };
    loadCases();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = (await response.json()) as { students: StudentOption[] };
        setStudentOptions(data.students ?? []);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      const updates: Record<string, CaseDocumentRow[]> = {};
      const assignmentUpdates: Record<string, AssignmentRow[]> = {};
      await Promise.all(
        myCases.map(async (caseItem) => {
          const response = await fetch(`/api/cases/${caseItem.id}`);
          if (response.ok) {
            const data = (await response.json()) as {
              case: CaseRow;
              documents: CaseDocumentRow[];
              pendingStudents: AssignmentRow[];
              acceptedStudents: AssignmentRow[];
            };
            updates[caseItem.id] = data.documents;
            assignmentUpdates[caseItem.id] = [
              ...(data.pendingStudents ?? []),
              ...(data.acceptedStudents ?? []),
            ];
          }
        })
      );
      if (Object.keys(updates).length) {
        setDocumentsByCase((prev) => ({ ...prev, ...updates }));
      }
      if (Object.keys(assignmentUpdates).length) {
        setAssignmentsByCase((prev) => ({ ...prev, ...assignmentUpdates }));
      }
    };
    if (myCases.length) {
      loadDocuments();
    }
  }, [myCases]);

  const handleAcceptCase = async (caseId: string) => {
    setError(null);
    const response = await fetch(`/api/cases/${caseId}/accept`, { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to accept case");
      return;
    }
    const data = (await response.json()) as { case: CaseRow };
    setOpenCases((prev) => prev.filter((item) => item.id !== data.case.id));
    setMyCases((prev) => [data.case, ...prev]);
  };

  const handleDocumentUpload = async (caseId: string) => {
    const file = selectedFile[caseId];
    if (!file) {
      return;
    }
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: `mock://uploads/${file.name}` }),
    });
    if (response.ok) {
      const data = (await response.json()) as { document: CaseDocumentRow };
      setDocumentsByCase((prev) => ({
        ...prev,
        [caseId]: [data.document, ...(prev[caseId] ?? [])],
      }));
    }
    setSelectedFile((prev) => ({ ...prev, [caseId]: null }));
  };

  const handleAssignStudent = async (caseId: string) => {
    const studentId = selectedStudent[caseId];
    if (!studentId) {
      setError("Select a student before assigning.");
      return;
    }
    setError(null);
    const response = await fetch(`/api/cases/${caseId}/assign-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to assign student");
      return;
    }
    const data = (await response.json()) as { assignment: AssignmentRow };
    setAssignmentsByCase((prev) => ({
      ...prev,
      [caseId]: [data.assignment, ...(prev[caseId] ?? [])],
    }));
    setSelectedStudent((prev) => ({ ...prev, [caseId]: "" }));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Lawyer Console</p>
          <h1 className="text-3xl font-semibold text-white">
            Welcome, {currentUser?.email ?? "Lawyer"}
          </h1>
          <p className="text-sm text-slate-400">
            You only see cases you have accepted.
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
        <div>
          <h2 className="text-lg font-semibold text-white">Open Pro-Bono Cases</h2>
          <p className="text-sm text-slate-400">
            Marketplace visibility: lawyers can review all unassigned cases and accept one.
          </p>
        </div>
        <div className="grid gap-3">
          {openCases.length ? (
            openCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{caseItem.title}</p>
                    <p className="text-slate-400">
                      {caseItem.category} · Score {caseItem.difficulty_score} ·{" "}
                      {caseItem.complexity_tag}
                    </p>
                    <p className="mt-2 text-slate-400">
                      {caseItem.description.slice(0, 120)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptCase(caseItem.id)}
                    className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-400"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No open cases right now.</p>
          )}
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-white">My Accepted Cases</h2>
        {myCases.length ? (
          myCases.map((caseItem) => {
          const caseDocuments = documentsByCase[caseItem.id] ?? [];
          const caseAssignments = assignmentsByCase[caseItem.id] ?? [];
          const pendingAssignments = caseAssignments.filter((item) => item.status === "pending");
          const acceptedAssignments = caseAssignments.filter((item) => item.status === "accepted");

          return (
            <article
              key={caseItem.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{caseItem.title}</h2>
                  <p className="text-sm text-slate-400">
                      {caseItem.category}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                    {caseItem.status}
                  </span>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200">
                      Score {caseItem.difficulty_score} · {caseItem.complexity_tag}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300">{caseItem.description}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                  <p className="font-semibold text-white">Document uploads</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(event) =>
                        setSelectedFile((prev) => ({
                          ...prev,
                          [caseItem.id]: event.target.files?.[0] ?? null,
                        }))
                      }
                      className="flex-1 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-300"
                    />
                    <button
                      onClick={() => handleDocumentUpload(caseItem.id)}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      Upload
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2 text-slate-400">
                    {caseDocuments.length ? (
                      caseDocuments.map((doc) => (
                        <li key={doc.id}>
                          {doc.file_url} · {formatDate(doc.created_at)}
                        </li>
                      ))
                    ) : (
                      <li>No documents yet</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                  <p className="font-semibold text-white">Assign law students</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Students must accept before joining the case.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={selectedStudent[caseItem.id] ?? ""}
                      onChange={(event) =>
                        setSelectedStudent((prev) => ({
                          ...prev,
                          [caseItem.id]: event.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-white"
                    >
                      <option value="">Select student</option>
                      {studentOptions.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignStudent(caseItem.id)}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      Assign
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    Pending: {pendingAssignments.length} · Accepted: {acceptedAssignments.length}
                  </div>
                  <Link
                    href={`/case/${caseItem.id}`}
                    className="mt-3 inline-block rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                  >
                    Open case view
                  </Link>
                </div>
              </div>
            </article>
          );
        })
        ) : (
          <p className="text-sm text-slate-400">No accepted cases yet.</p>
        )}
      </section>
    </main>
  );
}

export default function LawyerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="lawyer">
      <LawyerDashboardContent />
    </ProtectedRoute>
  );
}
