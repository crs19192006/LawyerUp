"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const getFileName = (url: string) => url.split("/").pop() ?? url;

type CaseRow = {
  id: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_bpl_certificate_url?: string | null;
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

type StudentOption = {
  id: string;
  name: string;
  email: string;
  college?: string | null;
};

type AssignmentRow = {
  id: string;
  case_id: string;
  student_id?: string;
  name?: string;
  college?: string | null;
  status: "pending" | "accepted" | "rejected";
};

function LawyerDashboardContent() {
  const { currentUser, logout } = useAuth();
  const [openCases, setOpenCases] = useState<CaseRow[]>([]);
  const [myCases, setMyCases] = useState<CaseRow[]>([]);
  const [documentsByCase, setDocumentsByCase] = useState<Record<string, CaseDocumentRow[]>>({});
  const [assignmentsByCase, setAssignmentsByCase] = useState<Record<string, AssignmentRow[]>>({});
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});
  const [statusNotes, setStatusNotes] = useState<Record<string, string>>({});
  const [nextHearings, setNextHearings] = useState<Record<string, string>>({});
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
    const formData = new FormData();
    formData.append("file", file);
    const uploadResponse = await fetch("/api/uploads", { method: "POST", body: formData });
    if (!uploadResponse.ok) {
      setSelectedFile((prev) => ({ ...prev, [caseId]: null }));
      return;
    }
    const uploadData = (await uploadResponse.json()) as { url: string };
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: uploadData.url }),
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

  const handleUpdateStatus = async (caseId: string) => {
    const statusNote = statusNotes[caseId] ?? "";
    const nextHearingAt = nextHearings[caseId] ?? "";
    if (!statusNote.trim()) {
      setError("Enter a status update before saving.");
      return;
    }
    setError(null);
    const response = await fetch(`/api/cases/${caseId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusNote, nextHearingAt: nextHearingAt || null }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to update status");
      return;
    }
    const data = (await response.json()) as { statusNote: string | null; nextHearingAt: string | null };
    setMyCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? { ...item, status_note: data.statusNote, next_hearing_at: data.nextHearingAt }
          : item
      )
    );
    setStatusNotes((prev) => ({ ...prev, [caseId]: data.statusNote ?? statusNote }));
    setNextHearings((prev) => ({ ...prev, [caseId]: data.nextHearingAt ?? nextHearingAt }));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Lawyer Console</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome, {currentUser?.email ?? "Lawyer"}
          </h1>
          <p className="text-sm text-slate-600">
            You only see cases you have accepted.
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
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Open Pro-Bono Cases</h2>
          <p className="text-sm text-slate-600">
            Marketplace visibility: lawyers can review all unassigned cases and accept one.
          </p>
        </div>
        <div className="grid gap-3">
          {openCases.length ? (
            openCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{caseItem.title}</p>
                    <p className="text-slate-600">
                      {caseItem.category} · Score {caseItem.difficulty_score} ·{" "}
                      {caseItem.complexity_tag}
                    </p>
                    <div className="mt-2 text-xs text-slate-600">
                      <p>
                        Client: {caseItem.client_name ?? "Unknown"} · {caseItem.client_email ?? ""}
                      </p>
                      {caseItem.client_bpl_certificate_url ? (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-slate-500">Client BPL/SC/ST certificate:</span>
                          <a
                            href={caseItem.client_bpl_certificate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            View
                          </a>
                          <a
                            href={caseItem.client_bpl_certificate_url}
                            download
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="text-slate-500">
                          Client BPL/SC/ST certificate: Not provided
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-slate-600">
                      {caseItem.description.slice(0, 120)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptCase(caseItem.id)}
                    className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No open cases right now.</p>
          )}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-slate-900">My Accepted Cases</h2>
        {myCases.length ? (
          myCases.map((caseItem) => {
          const caseDocuments = documentsByCase[caseItem.id] ?? [];
          const caseAssignments = assignmentsByCase[caseItem.id] ?? [];
          const pendingAssignments = caseAssignments.filter((item) => item.status === "pending");
          const acceptedAssignments = caseAssignments.filter((item) => item.status === "accepted");

          return (
            <article
              key={caseItem.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{caseItem.title}</h2>
                  <p className="text-sm text-slate-600">
                      {caseItem.category}
                  </p>
                  <div className="mt-2 text-sm text-slate-600">
                    <p>
                      Client: {caseItem.client_name ?? "Unknown"} · {caseItem.client_email ?? ""}
                    </p>
                    {caseItem.client_bpl_certificate_url ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Client BPL/SC/ST certificate:</span>
                        <a
                          href={caseItem.client_bpl_certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          View
                        </a>
                        <a
                          href={caseItem.client_bpl_certificate_url}
                          download
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Client BPL/SC/ST certificate: Not provided
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {caseItem.status}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                      Score {caseItem.difficulty_score} · {caseItem.complexity_tag}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600">{caseItem.description}</p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">Case status update</p>
                <p className="mt-2 text-xs text-slate-600">
                  Current status: {caseItem.status_note ?? "Awaiting update"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Next hearing: {caseItem.next_hearing_at ? formatDate(caseItem.next_hearing_at ?? "") : "Not scheduled"}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input
                    value={statusNotes[caseItem.id] ?? caseItem.status_note ?? ""}
                    onChange={(event) =>
                      setStatusNotes((prev) => ({ ...prev, [caseItem.id]: event.target.value }))
                    }
                    placeholder="Type a status update"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
                  />
                  <input
                    type="date"
                    value={nextHearings[caseItem.id] ?? caseItem.next_hearing_at ?? ""}
                    onChange={(event) =>
                      setNextHearings((prev) => ({ ...prev, [caseItem.id]: event.target.value }))
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
                  />
                </div>
                <button
                  onClick={() => handleUpdateStatus(caseItem.id)}
                  className="mt-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save status
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">Case documents</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(event) =>
                        setSelectedFile((prev) => ({
                          ...prev,
                          [caseItem.id]: event.target.files?.[0] ?? null,
                        }))
                      }
                      className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                    />
                    <button
                      onClick={() => handleDocumentUpload(caseItem.id)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                    >
                      Upload
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2 text-slate-600">
                    {caseDocuments.length ? (
                      caseDocuments.map((doc) => (
                        <li key={doc.id}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-500">Case document:</span>
                            <span className="text-slate-700">{getFileName(doc.file_url)}</span>
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
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>No documents yet</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">Assign law students</p>
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
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                    >
                      <option value="">Select student</option>
                      {studentOptions.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email}){student.college ? ` · ${student.college}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignStudent(caseItem.id)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                    >
                      Assign
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    Pending: {pendingAssignments.length} · Accepted: {acceptedAssignments.length}
                  </div>
                  {acceptedAssignments.length ? (
                    <div className="mt-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Accepted students</p>
                      <ul className="mt-2 space-y-1">
                        {acceptedAssignments.map((student) => (
                          <li key={student.id}>
                            {student.name ?? "Student"}
                            {student.college ? ` · ${student.college}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {pendingAssignments.length ? (
                    <div className="mt-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Pending students</p>
                      <ul className="mt-2 space-y-1">
                        {pendingAssignments.map((student) => (
                          <li key={student.id}>
                            {student.name ?? "Student"}
                            {student.college ? ` · ${student.college}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <Link
                    href={`/case/${caseItem.id}`}
                    className="mt-3 inline-block rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                  >
                    Open case view
                  </Link>
                </div>
              </div>
            </article>
          );
        })
        ) : (
          <p className="text-sm text-slate-600">No accepted cases yet.</p>
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
