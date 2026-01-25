"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { simplifyLegalText } from "../../../lib/simplify";

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

type PersonRow = {
  id: string;
  name: string;
};

type AssignmentRow = {
  id: string;
  name: string;
  status: "pending" | "accepted";
};

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [caseItem, setCaseItem] = useState<CaseRow | null>(null);
  const [documents, setDocuments] = useState<CaseDocumentRow[]>([]);
  const [lawyer, setLawyer] = useState<PersonRow | null>(null);
  const [acceptedStudents, setAcceptedStudents] = useState<AssignmentRow[]>([]);
  const [pendingStudents, setPendingStudents] = useState<AssignmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [legalText, setLegalText] = useState("");
  const simplified = simplifyLegalText(legalText);

  useEffect(() => {
    if (!caseId) {
      setError("Invalid case ID");
      return;
    }
    const loadCase = async () => {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Unable to load case");
        return;
      }
      const data = (await response.json()) as {
        case: CaseRow;
        documents: CaseDocumentRow[];
        lawyer: PersonRow | null;
        acceptedStudents: AssignmentRow[];
        pendingStudents: AssignmentRow[];
      };
      setCaseItem(data.case);
      setDocuments(data.documents);
      setLawyer(data.lawyer);
      setAcceptedStudents(data.acceptedStudents ?? []);
      setPendingStudents(data.pendingStudents ?? []);
    };
    loadCase();
  }, [caseId]);

  if (!caseItem) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold text-white">
          {error ?? "Loading case..."}
        </h1>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Return to landing
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Case View</p>
          <h1 className="text-3xl font-semibold text-white">{caseItem.title}</h1>
          <p className="text-sm text-slate-400">
            {caseItem.category} · Created {formatDate(caseItem.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            {caseItem.status}
          </span>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200">
            {caseItem.complexity_tag} · Score {caseItem.difficulty_score}
          </span>
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            Back to landing
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold text-white">Case summary</h2>
        <p className="mt-3 text-sm text-slate-300">{caseItem.description}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">Assigned lawyer</p>
            <p className="mt-2 text-slate-400">
              {lawyer?.name ?? caseItem.assigned_lawyer_id ?? "Unassigned"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">Status badge</p>
            <p className="mt-2 text-slate-400">{caseItem.status}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Assigned students</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {acceptedStudents.length ? (
              acceptedStudents.map((student) => (
                <li key={student.id}>{student.name}</li>
              ))
            ) : (
              <li>No accepted students yet</li>
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Document history</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            {documents.length ? (
              documents.map((doc) => (
                <li key={doc.id}>
                  {doc.file_url} · {formatDate(doc.created_at)}
                </li>
              ))
            ) : (
              <li>No documents yet</li>
            )}
          </ul>
        </div>
      </section>

      {pendingStudents.length ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Pending student invites</h2>
          <p className="mt-2 text-sm text-slate-400">
            Students must accept before joining the case.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {pendingStudents.map((student) => (
              <li key={student.id}>{student.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Simplify Legal Text</h2>
        <p className="mt-2 text-sm text-slate-400">
          Paste legal text to generate a plain-English summary (mocked for demo).
        </p>
        <textarea
          value={legalText}
          onChange={(event) => setLegalText(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white"
          placeholder="Enter legal text to simplify"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">Summary</p>
            <p className="mt-2 text-slate-400">{simplified.summary}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">Bullet points</p>
            <ul className="mt-2 space-y-2 text-slate-400">
              {simplified.bullets.map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">What this means for you</p>
            <p className="mt-2 text-slate-400">{simplified.meaning}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
