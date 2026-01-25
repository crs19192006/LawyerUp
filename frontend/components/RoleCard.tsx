import Link from "next/link";
import type { RoleOption } from "../lib/api";

type RoleCardProps = {
  role: RoleOption;
};

export default function RoleCard({ role }: RoleCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{role.level}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{role.title}</h3>
        <p className="mt-3 text-sm text-slate-300">{role.summary}</p>
      </div>
      <Link
        href="/roadmap"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        Select Role
      </Link>
    </div>
  );
}
