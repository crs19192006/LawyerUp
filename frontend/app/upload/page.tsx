import Link from "next/link";

export default function UploadPage() {
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
          <Link href="/role" className="hover:text-white">
            Roles
          </Link>
        </div>
      </nav>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10">
        <h1 className="text-3xl font-semibold text-white">Upload your resume</h1>
        <p className="mt-3 text-sm text-slate-400">
          PDF extraction is mocked in this MVP. Gemini parsing will be plugged in
          later.
        </p>
        <form className="mt-8 space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
            Drag and drop or click to select a PDF.
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="block w-full rounded-full border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
          />
          <button
            type="button"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Upload Resume
          </button>
        </form>
      </section>
    </main>
  );
}
