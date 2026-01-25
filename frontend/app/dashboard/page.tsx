import Link from "next/link";
import SkillChart from "../../components/SkillChart";
import { getGapItems, getSkillInsights } from "../../lib/api";

export default async function DashboardPage() {
  const [skills, gaps] = await Promise.all([getSkillInsights(), getGapItems()]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-6 py-12">
      <nav className="flex items-center justify-between text-sm text-slate-400">
        <Link href="/" className="font-semibold text-white">
          Skill Intelligence
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/upload" className="hover:text-white">
            Upload
          </Link>
          <Link href="/role" className="hover:text-white">
            Roles
          </Link>
          <Link href="/roadmap" className="hover:text-white">
            Roadmap
          </Link>
        </div>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <SkillChart skills={skills} />
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white">Gap Analysis</h3>
          <p className="text-sm text-slate-400">Priority focus skills this quarter.</p>
          <div className="mt-6 space-y-4">
            {gaps.map((gap) => (
              <div
                key={gap.skill}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{gap.skill}</span>
                  <span className="text-slate-400">Gap {gap.gap}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${gap.targetLevel}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
