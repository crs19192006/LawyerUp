import Link from "next/link";
import RoleCard from "../../components/RoleCard";
import { getRoleOptions } from "../../lib/api";

export default async function RolePage() {
  const roles = await getRoleOptions();

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-10 px-6 py-12">
      <nav className="flex items-center justify-between text-sm text-slate-600">
        <Link href="/" className="font-semibold text-slate-900">
          Skill Intelligence
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/roadmap" className="hover:text-slate-900">
            Roadmap
          </Link>
        </div>
      </nav>

      <section>
        <h1 className="text-3xl font-semibold text-slate-900">Choose a target role</h1>
        <p className="mt-2 text-sm text-slate-600">
          These roles drive the gap analysis and roadmap planning.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>
    </main>
  );
}
