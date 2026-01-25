import Link from "next/link";

export default function UploadPage() {
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
          <Link href="/role" className="hover:text-slate-900">
            Roles
          </Link>
        </div>
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Upload your resume</h1>
        <p className="mt-3 text-sm text-slate-600">
          PDF extraction is mocked in this MVP. Automated parsing will be plugged in
          later.
        </p>
        <form className="mt-8 space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            Drag and drop or click to select a PDF.
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="block w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
          />
          <button
            type="button"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Upload Resume
          </button>
        </form>
      </section>
    </main>
  );
}
