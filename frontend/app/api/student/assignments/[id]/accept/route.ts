import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../../../lib/authServer";
import { getDb } from "../../../../../../lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can accept assignments" }, { status: 403 });
  }

  const db = getDb();
  const assignment = db
    .prepare("SELECT * FROM case_student_assignments WHERE id = ?")
    .get(params.id);

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (assignment.student_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Student must explicitly accept to join the case.
  db.prepare("UPDATE case_student_assignments SET status = 'accepted' WHERE id = ?").run(
    params.id
  );

  const updated = db
    .prepare("SELECT * FROM case_student_assignments WHERE id = ?")
    .get(params.id);
  return NextResponse.json({ assignment: updated });
}
