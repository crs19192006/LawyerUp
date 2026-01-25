import Link from "next/link";
import { getInterviewQuestions } from "../../lib/api";

export default async function InterviewPage() {
  const questions = await getInterviewQuestions();

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-10 px-6 py-12">
      <nav className="flex items-center justify-between text-sm text-slate-600">
        <Link href="/" className="font-semibold text-slate-900">
          Skill Intelligence
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/roadmap" className="hover:text-slate-900">
            Roadmap
          </Link>
        </div>
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Interview prep</h1>
        <p className="mt-2 text-sm text-slate-600">
          Mock questions generated for your role. Automated generation will be added later.
        </p>
        <div className="mt-8 space-y-4">
          {questions.map((question) => (
            <div
              key={question.question}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">
                {question.category}
              </p>
              <p className="mt-3 text-sm text-slate-700">{question.question}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
