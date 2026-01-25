import type { SkillInsight } from "../lib/api";

type SkillChartProps = {
  skills: SkillInsight[];
};

export default function SkillChart({ skills }: SkillChartProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="text-lg font-semibold text-white">Skill Intelligence</h3>
      <p className="text-sm text-slate-400">Mocked insights for the current resume.</p>
      <div className="mt-6 space-y-4">
        {skills.map((skill) => (
          <div key={skill.skill} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{skill.skill}</span>
              <span className="text-slate-400">{skill.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-indigo-500"
                style={{ width: `${skill.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
