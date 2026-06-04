import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/authServer";
import { getDb } from "../../../../lib/db";

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can access assignments" }, { status: 403 });
  }

  const db = getDb();
  const assignments = db
    .prepare(
      `SELECT
        a.id,
        a.case_id,
        a.status,
        a.created_at,
        c.title,
        c.category,
        u.name AS lawyer_name
      FROM case_student_assignments a
      JOIN cases c ON c.id = a.case_id
      JOIN users u ON u.id = a.lawyer_id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC`
    )
    .all(user.id);

  return NextResponse.json({ assignments });
}
