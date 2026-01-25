import Link from "next/link";
import RoadmapTimeline from "../../components/RoadmapTimeline";
import { getRoadmapWeeks } from "../../lib/api";

export default async function RoadmapPage() {
  const weeks = await getRoadmapWeeks();

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
          <Link href="/interview" className="hover:text-slate-900">
            Interview
          </Link>
        </div>
      </nav>

      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Your 4-week roadmap</h1>
        <p className="text-sm text-slate-600">
          Weekly milestones aligned with your selected role.
        </p>
      </section>

      <RoadmapTimeline weeks={weeks} />
    </main>
  );
}
