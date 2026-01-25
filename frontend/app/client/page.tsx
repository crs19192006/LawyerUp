"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CASE_CATEGORIES, CaseCategory } from "../../lib/constants";
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

export function ClientDashboardContent() {
  const { currentUser, logout } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [documentsByCase, setDocumentsByCase] = useState<Record<string, CaseDocumentRow[]>>({});
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});
  const [newCaseFile, setNewCaseFile] = useState<File | null>(null);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    category: "Family Law" as CaseCategory,
  });

  useEffect(() => {
    const loadCases = async () => {
      const response = await fetch("/api/cases");
      if (response.ok) {
        const data = (await response.json()) as { cases: CaseRow[] };
        setCases(data.cases);
      }
    };
    loadCases();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      const updates: Record<string, CaseDocumentRow[]> = {};
      await Promise.all(
        cases.map(async (caseItem) => {
          const response = await fetch(`/api/cases/${caseItem.id}`);
          if (response.ok) {
            const data = (await response.json()) as {
              case: CaseRow;
              documents: CaseDocumentRow[];
            };
            updates[caseItem.id] = data.documents;
          }
        })
      );
      if (Object.keys(updates).length) {
        setDocumentsByCase((prev) => ({ ...prev, ...updates }));
      }
    };
    if (cases.length) {
      loadDocuments();
    }
  }, [cases]);

  const handleCreateCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { case: CaseRow };
    setCases((prev) => [data.case, ...prev]);

    if (newCaseFile) {
      await fetch(`/api/cases/${data.case.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: `mock://uploads/${newCaseFile.name}` }),
      });
      setNewCaseFile(null);
    }

    setFormValues({ title: "", description: "", category: "Family Law" });
  };

  const handleUploadDocument = async (caseId: string) => {
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

  const casesWithDocs = useMemo(() => {
    return cases.map((caseItem) => ({
      ...caseItem,
      documents: documentsByCase[caseItem.id] ?? [],
    }));
  }, [cases, documentsByCase]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Client Portal</p>
          <h1 className="text-3xl font-semibold text-white">
            Welcome, {currentUser?.email ?? "Client"}
          </h1>
          <p className="text-sm text-slate-300">Your cases are private to your account.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Create a case</h2>
          <p className="text-sm text-slate-400">
            Upload case documents and share case details.
          </p>
        </div>
        <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Title</label>
            <input
              required
              value={formValues.title}
              onChange={(event) => setFormValues({ ...formValues, title: event.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Category</label>
            <select
              value={formValues.category}
              onChange={(event) =>
                setFormValues({ ...formValues, category: event.target.value as CaseCategory })
              }
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            >
              {CASE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">Description</label>
            <textarea
              required
              value={formValues.description}
              onChange={(event) =>
                setFormValues({ ...formValues, description: event.target.value })
              }
              rows={4}
              className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Upload case document
            </label>
            <input
              type="file"
              onChange={(event) => setNewCaseFile(event.target.files?.[0] ?? null)}
              className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Submit Case
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your cases</h2>
          <span className="text-sm text-slate-400">{cases.length} total</span>
        </div>
        <div className="grid gap-4">
          {casesWithDocs.map((caseItem) => {
            return (
              <article
                key={caseItem.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{caseItem.title}</h3>
                    <p className="text-sm text-slate-400">{caseItem.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      {caseItem.status}
                    </span>
                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200">
                      {caseItem.complexity_tag} · Score {caseItem.difficulty_score}
                    </span>
                    <Link
                      href={`/case/${caseItem.id}`}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                    >
                      View Case
                    </Link>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">{caseItem.description}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                    <p className="font-semibold text-white">Assigned team</p>
                    <p className="mt-2 text-slate-400">
                      Lawyer: {caseItem.assigned_lawyer_id ? "Assigned" : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                    <p className="font-semibold text-white">Add document</p>
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
                        onClick={() => handleUploadDocument(caseItem.id)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                  <p className="font-semibold text-white">Document history</p>
                  <ul className="mt-2 space-y-2 text-slate-400">
                    {caseItem.documents.length ? (
                      caseItem.documents.map((doc) => (
                        <li key={doc.id}>
                          {doc.file_url} · {formatDate(doc.created_at)}
                        </li>
                      ))
                    ) : (
                      <li>No documents yet</li>
                    )}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute allowedRole="client">
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
