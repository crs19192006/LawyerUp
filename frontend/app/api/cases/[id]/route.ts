import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/authServer";
import { getDb } from "../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const caseRow = db.prepare("SELECT * FROM cases WHERE id = ?").get(params.id);

  if (!caseRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isClientOwner = caseRow.client_id === user.id;
  const isAssignedLawyer = caseRow.assigned_lawyer_id === user.id;

  // Enforce ownership so users cannot access other clients' cases.
  if (user.role === "client" && !isClientOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "lawyer" && !isAssignedLawyer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = db
    .prepare("SELECT * FROM case_documents WHERE case_id = ? ORDER BY created_at DESC")
    .all(params.id);

  const acceptedStudents = db
    .prepare(
      `SELECT u.id, u.name, a.status
       FROM case_student_assignments a
       JOIN users u ON u.id = a.student_id
       WHERE a.case_id = ? AND a.status = 'accepted'`
    )
    .all(params.id);

  const pendingStudents = db
    .prepare(
      `SELECT u.id, u.name, a.status
       FROM case_student_assignments a
       JOIN users u ON u.id = a.student_id
       WHERE a.case_id = ? AND a.status = 'pending'`
    )
    .all(params.id);

  const lawyer = caseRow.assigned_lawyer_id
    ? db.prepare("SELECT id, name FROM users WHERE id = ?").get(caseRow.assigned_lawyer_id)
    : null;

  return NextResponse.json({ case: caseRow, documents, lawyer, acceptedStudents, pendingStudents });
}
