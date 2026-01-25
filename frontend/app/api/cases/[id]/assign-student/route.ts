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
    return NextResponse.json({ error: "Only lawyers can assign students" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const studentId = body?.studentId as string | undefined;
  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  const db = getDb();
  const caseRow = db.prepare("SELECT * FROM cases WHERE id = ?").get(params.id);
  if (!caseRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Enforce ownership: lawyer can only assign students to their own cases.
  if (caseRow.assigned_lawyer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const studentRow = db
    .prepare("SELECT id FROM users WHERE id = ? AND role = 'student'")
    .get(studentId);
  if (!studentRow) {
    return NextResponse.json({ error: "Invalid student" }, { status: 400 });
  }

  const existing = db
    .prepare(
      "SELECT id FROM case_student_assignments WHERE case_id = ? AND student_id = ?"
    )
    .get(params.id, studentId);
  if (existing) {
    return NextResponse.json({ error: "Student already assigned" }, { status: 409 });
  }

  const assignmentId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO case_student_assignments (id, case_id, student_id, lawyer_id, status, created_at)
     VALUES (@id, @case_id, @student_id, @lawyer_id, @status, @created_at)`
  ).run({
    id: assignmentId,
    case_id: params.id,
    student_id: studentId,
    lawyer_id: user.id,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  const assignment = db
    .prepare("SELECT * FROM case_student_assignments WHERE id = ?")
    .get(assignmentId);

  return NextResponse.json({ assignment });
}
