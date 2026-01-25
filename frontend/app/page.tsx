import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-12">
      <nav className="flex items-center justify-between text-sm text-slate-400">
        <span className="flex items-center gap-2 text-white">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          <span className="font-semibold tracking-wide">NyayaConnect</span>
        </span>
        <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
          India · Demo MVP
        </span>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
            Decentralized Pro-Bono Legal Aid
          </p>
          <h1 className="text-4xl font-semibold text-white lg:text-5xl">
            Connect verified clients with pro-bono lawyers and law students.
          </h1>
          <p className="text-lg text-slate-300">
            NyayaConnect coordinates eligibility-verified cases, smart case scoring,
            and transparent timelines—built for speed, clarity, and demo impact.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="rounded-full border border-slate-800 px-3 py-1">
              Role-based access
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1">
              Audit-friendly trails
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1">
              India-ready flows
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login/client"
              className="rounded-2xl bg-indigo-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Login as Client
            </Link>
            <Link
              href="/login/lawyer"
              className="rounded-2xl border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Login as Lawyer
            </Link>
            <Link
              href="/login/student"
              className="rounded-2xl border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Login as Law Student
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900 to-indigo-900/30 p-8">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Demo Highlights</h2>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                Live MVP
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <Image
                src="/lady-justice.svg"
                alt="Lady Justice"
                width={520}
                height={580}
                className="h-64 w-full rounded-2xl object-cover"
                priority
              />
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>Verified client eligibility with secure intake</li>
              <li>Role-based dashboards for clients, lawyers, and students</li>
              <li>Smart case scoring with complexity tags</li>
              <li>Transparency layer with status + document history</li>
              <li>Legal document simplifier (mocked)</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
