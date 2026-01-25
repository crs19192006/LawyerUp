import Link from "next/link";
import { getInterviewQuestions } from "../../lib/api";

export default async function InterviewPage() {
  const questions = await getInterviewQuestions();

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-10 px-6 py-12">
      <nav className="flex items-center justify-between text-sm text-slate-400">
        <Link href="/" className="font-semibold text-white">
          Skill Intelligence
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/roadmap" className="hover:text-white">
            Roadmap
          </Link>
        </div>
      </nav>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10">
        <h1 className="text-3xl font-semibold text-white">Interview prep</h1>
        <p className="mt-2 text-sm text-slate-400">
          Mock questions generated for your role. Gemini will power this flow.
        </p>
        <div className="mt-8 space-y-4">
          {questions.map((question) => (
            <div
              key={question.question}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">
                {question.category}
              </p>
              <p className="mt-3 text-sm text-slate-200">{question.question}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
