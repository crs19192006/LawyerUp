import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-14 px-6 py-12 text-center">
      <nav className="flex w-full items-center justify-center text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-2xl font-semibold tracking-wide text-slate-900">LawyerUp</span>
        </span>
      </nav>

      <section className="space-y-10">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">
          Decentralized Pro-Bono Legal Aid
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-900 lg:text-6xl">
          Connect verified clients with pro-bono lawyers and law students.
        </h1>
        <p className="text-lg leading-relaxed text-slate-600">
          LawyerUp coordinates eligibility-verified cases, thoughtful case scoring,
          and transparent timelines—built for speed, clarity, and care.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Role-based access
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Audit-friendly trails
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            India-ready flows
          </span>
        </div>
        <div className="grid w-full gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href="/login/client"
              className="block rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login as Client
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              File new cases and keep all your documents in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href="/login/lawyer"
              className="block rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Login as Lawyer
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Register as a lawyer and view all open cases to accept.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href="/login/student"
              className="block rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Login as Law Student
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              View cases accepted by lawyers and apply to intern on them.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
