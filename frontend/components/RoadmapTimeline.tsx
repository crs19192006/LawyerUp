import type { RoadmapWeek } from "../lib/api";

type RoadmapTimelineProps = {
  weeks: RoadmapWeek[];
};

export default function RoadmapTimeline({ weeks }: RoadmapTimelineProps) {
  return (
    <div className="space-y-6">
      {weeks.map((week) => (
        <div
          key={week.week}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Week {week.week}</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
              {week.theme}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {week.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
