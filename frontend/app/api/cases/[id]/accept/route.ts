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
    return NextResponse.json({ error: "Only lawyers can accept cases" }, { status: 403 });
  }

  const db = getDb();
  const caseRow = db.prepare("SELECT * FROM cases WHERE id = ?").get(params.id);

  if (!caseRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (caseRow.assigned_lawyer_id && caseRow.assigned_lawyer_id !== user.id) {
    return NextResponse.json({ error: "Case already assigned" }, { status: 409 });
  }

  db.prepare("UPDATE cases SET assigned_lawyer_id = ?, status = ? WHERE id = ?").run(
    user.id,
    "Accepted",
    params.id
  );

  const updated = db.prepare("SELECT * FROM cases WHERE id = ?").get(params.id);
  return NextResponse.json({ case: updated });
}
