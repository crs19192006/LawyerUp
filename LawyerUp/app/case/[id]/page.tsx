"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { simplifyLegalText } from "../../../lib/simplify";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const getFileName = (url: string) => url.split("/").pop() ?? url;

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
        <h1 className="text-2xl font-semibold text-slate-900">
          {error ?? "Loading case..."}
        </h1>
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
          Return to landing
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Case View</p>
          <h1 className="text-3xl font-semibold text-slate-900">{caseItem.title}</h1>
          <p className="text-sm text-slate-600">
            {caseItem.category} · Created {formatDate(caseItem.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            {caseItem.status}
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
            {caseItem.complexity_tag} · Score {caseItem.difficulty_score}
          </span>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
            Back to landing
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Case summary</h2>
        <p className="mt-3 text-sm text-slate-600">{caseItem.description}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">Assigned lawyer</p>
            <p className="mt-2 text-slate-600">
              {lawyer?.name ?? caseItem.assigned_lawyer_id ?? "Unassigned"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">Status badge</p>
            <p className="mt-2 text-slate-600">{caseItem.status}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Assigned students</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {acceptedStudents.length ? (
              acceptedStudents.map((student) => (
                <li key={student.id}>{student.name}</li>
              ))
            ) : (
              <li>No accepted students yet</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Document history</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {documents.length ? (
              documents.map((doc) => (
                <li key={doc.id}>
                  <div className="flex flex-wrap items-center gap-2">
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
      </section>

      {pendingStudents.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Pending student invites</h2>
          <p className="mt-2 text-sm text-slate-600">
            Students must accept before joining the case.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {pendingStudents.map((student) => (
              <li key={student.id}>{student.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Simplify Legal Text</h2>
        <p className="mt-2 text-sm text-slate-600">
          Paste legal text to generate a plain-English summary (mocked for demo).
        </p>
        <textarea
          value={legalText}
          onChange={(event) => setLegalText(event.target.value)}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="Enter legal text to simplify"
        />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">Summary</p>
            <p className="mt-2 text-slate-600">{simplified.summary}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">Bullet points</p>
            <ul className="mt-2 space-y-2 text-slate-600">
              {simplified.bullets.map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">What this means for you</p>
            <p className="mt-2 text-slate-600">{simplified.meaning}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
