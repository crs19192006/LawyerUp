"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CASE_CATEGORIES, CaseCategory } from "../../lib/constants";
import { useAuth } from "../../lib/auth";
import ProtectedRoute from "../../components/ProtectedRoute";
import { simplifyLegalText } from "../../lib/simplify";
import { LEGAL_GLOSSARY } from "../../lib/glossary";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const getFileName = (url: string) => url.split("/").pop() ?? url;

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
] as const;
type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

const translateText = (text: string, language: LanguageOption) => {
  if (language === "English") {
    return text;
  }
  return `[${language}] ${text}`;
};

type CaseRow = {
  id: string;
  client_id: string;
  assigned_lawyer_id: string | null;
  lawyer_name?: string | null;
  lawyer_email?: string | null;
  lawyer_contact_number?: string | null;
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

function ClientDashboardContent() {
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
  const [legalText, setLegalText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("English");
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiBullets, setAiBullets] = useState<string[] | null>(null);
  const [aiMeaning, setAiMeaning] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

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
      const formData = new FormData();
      formData.append("file", newCaseFile);
      const uploadResponse = await fetch("/api/uploads", { method: "POST", body: formData });
      if (uploadResponse.ok) {
        const uploadData = (await uploadResponse.json()) as { url: string };
        await fetch(`/api/cases/${data.case.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: uploadData.url }),
        });
      }
      setNewCaseFile(null);
    }

    setFormValues({ title: "", description: "", category: "Family Law" });
  };

  const handleUploadDocument = async (caseId: string) => {
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

  const casesWithDocs = useMemo(() => {
    return cases.map((caseItem) => ({
      ...caseItem,
      documents: documentsByCase[caseItem.id] ?? [],
    }));
  }, [cases, documentsByCase]);

  const simplified = useMemo(() => simplifyLegalText(legalText), [legalText]);
  const translated = useMemo(() => {
    const summarySource = aiSummary ?? simplified.summary;
    const bulletsSource = aiBullets ?? simplified.bullets;
    const meaningSource = aiMeaning ?? simplified.meaning;
    return {
      summary: translateText(summarySource, selectedLanguage),
      bullets: bulletsSource.map((bullet) => translateText(bullet, selectedLanguage)),
      meaning: translateText(meaningSource, selectedLanguage),
    };
  }, [aiSummary, aiBullets, aiMeaning, simplified, selectedLanguage]);

  const filteredGlossary = useMemo(() => {
    const query = glossaryQuery.trim().toLowerCase();
    if (!query) {
      return LEGAL_GLOSSARY;
    }
    return LEGAL_GLOSSARY.filter(
      (item) =>
        item.term.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query)
    );
  }, [glossaryQuery]);

  const handleAskQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }
    const ask = async () => {
      setIsAsking(true);
      setAiError(null);
      try {
        const response = await fetch("/api/legal-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: legalText, question: trimmed, language: selectedLanguage }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Unable to answer");
        }
        const data = (await response.json()) as { answer?: string };
        const answer = data.answer ?? "I couldn't generate an answer right now.";
        setChatMessages((prev) => [
          { role: "user", text: trimmed },
          { role: "assistant", text: answer },
          ...prev,
        ]);
        setQuestion("");
      } catch (error) {
        const fallback = "I couldn't reach the assistant. Try again soon.";
        setChatMessages((prev) => [
          { role: "user", text: trimmed },
          { role: "assistant", text: fallback },
          ...prev,
        ]);
        setAiError(error instanceof Error ? error.message : "Unable to answer");
      } finally {
        setIsAsking(false);
      }
    };
    void ask();
  };

  const handleGenerateSummary = async () => {
    if (!legalText.trim()) {
      setAiError("Paste legal text before generating a summary.");
      return;
    }
    setIsGeneratingSummary(true);
    setAiError(null);
    try {
      const response = await fetch("/api/legal-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: legalText, language: selectedLanguage }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Unable to generate summary");
      }
      const data = (await response.json()) as {
        summary?: string;
        bullets?: string[];
        meaning?: string;
      };
      setAiSummary(data.summary ?? null);
      setAiBullets(data.bullets ?? null);
      setAiMeaning(data.meaning ?? null);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Unable to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Client Portal</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome, {currentUser?.email ?? "Client"}
          </h1>
          <p className="text-sm text-slate-600">Your cases are private to your account.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Create a case</h2>
          <p className="text-sm text-slate-600">
            Upload case documents and share case details.
          </p>
        </div>
        <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">Title</label>
            <input
              required
              value={formValues.title}
              onChange={(event) => setFormValues({ ...formValues, title: event.target.value })}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">Category</label>
            <select
              value={formValues.category}
              onChange={(event) =>
                setFormValues({ ...formValues, category: event.target.value as CaseCategory })
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {CASE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              required
              value={formValues.description}
              onChange={(event) =>
                setFormValues({ ...formValues, description: event.target.value })
              }
              rows={4}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">
              Upload case document
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setNewCaseFile(event.target.files?.[0] ?? null)}
              className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit Case
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your cases</h2>
          <span className="text-sm text-slate-600">{cases.length} total</span>
        </div>
        <div className="grid gap-4">
          {casesWithDocs.map((caseItem) => {
            return (
              <article
                key={caseItem.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{caseItem.title}</h3>
                    <p className="text-sm text-slate-600">{caseItem.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {caseItem.status}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                      {caseItem.complexity_tag} · Score {caseItem.difficulty_score}
                    </span>
                    <Link
                      href={`/case/${caseItem.id}`}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                    >
                      View Case
                    </Link>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{caseItem.description}</p>
                {caseItem.assigned_lawyer_id && caseItem.lawyer_name ? (
                  <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Your case has been accepted by Advocate {caseItem.lawyer_name}.
                    </p>
                    <p className="mt-2 text-xs text-slate-600">Their contact details are as follows:</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Email: {caseItem.lawyer_email ?? "Not shared"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Number: {caseItem.lawyer_contact_number ?? "Not shared"}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      Next hearing: {caseItem.next_hearing_at ? formatDate(caseItem.next_hearing_at ?? "") : "Not scheduled"}
                    </p>
                  </div>
                ) : null}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-900">Assigned team</p>
                    <p className="mt-2 text-slate-600">
                      Lawyer: {caseItem.assigned_lawyer_id ? "Assigned" : "Pending"}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      Current status: {caseItem.status_note ?? "Awaiting update"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-900">Add document</p>
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
                        className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-2 py-1 text-xs text-slate-600"
                      />
                      <button
                        onClick={() => handleUploadDocument(caseItem.id)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:border-slate-400"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">Document history</p>
                  <ul className="mt-2 space-y-2 text-slate-600">
                    {caseItem.documents.length ? (
                      caseItem.documents.map((doc) => (
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
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Legal literacy tools</h2>
          <p className="text-sm text-slate-600">
            Understand documents, learn key terms, and ask questions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Simplify & translate</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value as LanguageOption)}
                  className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
            <textarea
              value={legalText}
              onChange={(event) => setLegalText(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Paste legal text to simplify"
            />
            {aiError ? <p className="mt-2 text-xs text-red-600">{aiError}</p> : null}
            <div className="mt-4 grid gap-3 text-xs text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-semibold text-slate-700">Summary</p>
                <p className="mt-2">{translated.summary}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-semibold text-slate-700">Key points</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {translated.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-semibold text-slate-700">What this means</p>
                <p className="mt-2">{translated.meaning}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Legal glossary</h3>
                <input
                  value={glossaryQuery}
                  onChange={(event) => setGlossaryQuery(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  placeholder="Search terms"
                />
              </div>
              <ul className="mt-3 space-y-3 text-xs text-slate-600">
                {filteredGlossary.map((item) => (
                  <li key={item.term} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-800">{item.term}</p>
                    <p className="mt-1">{item.definition}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Ask a question</h3>
              <form onSubmit={handleAskQuestion} className="mt-3 flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Ask about a term or summary"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  disabled={isAsking}
                >
                  {isAsking ? "Thinking..." : "Ask"}
                </button>
              </form>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                {chatMessages.length ? (
                  chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-xl border border-slate-200 px-3 py-2 ${
                        message.role === "assistant" ? "bg-white" : "bg-indigo-50"
                      }`}
                    >
                      <p className="font-semibold text-slate-700">
                        {message.role === "assistant" ? "Legal helper" : "You"}
                      </p>
                      <p className="mt-1">{message.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    Ask a question to see a response here.
                  </p>
                )}
              </div>
            </div>
          </div>
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
