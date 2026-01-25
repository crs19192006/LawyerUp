import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../../lib/authServer";
import { getDb } from "../../../../../lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "lawyer") {
    return NextResponse.json({ error: "Only lawyers can update status" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { statusNote, nextHearingAt } = body ?? {};

  if (typeof statusNote !== "string" || !statusNote.trim()) {
    return NextResponse.json({ error: "Missing status note" }, { status: 400 });
  }

  const db = getDb();
  const caseRow = db
    .prepare("SELECT assigned_lawyer_id FROM cases WHERE id = ?")
    .get(params.id) as { assigned_lawyer_id: string | null } | undefined;

  if (!caseRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (caseRow.assigned_lawyer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  db.prepare("UPDATE cases SET status_note = ?, next_hearing_at = ? WHERE id = ?").run(
    statusNote.trim(),
    nextHearingAt ? String(nextHearingAt) : null,
    params.id
  );

  const updated = db.prepare("SELECT status_note, next_hearing_at FROM cases WHERE id = ?").get(
    params.id
  ) as { status_note: string | null; next_hearing_at: string | null } | undefined;

  return NextResponse.json({
    statusNote: updated?.status_note ?? null,
    nextHearingAt: updated?.next_hearing_at ?? null,
  });
}
