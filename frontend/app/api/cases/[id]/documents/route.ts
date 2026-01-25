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

  const db = getDb();
  const caseRow = db.prepare("SELECT * FROM cases WHERE id = ?").get(params.id);

  if (!caseRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isClientOwner = caseRow.client_id === user.id;
  const isAssignedLawyer = caseRow.assigned_lawyer_id === user.id;

  if (user.role === "client" && !isClientOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "lawyer" && !isAssignedLawyer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const fileUrl = body?.fileUrl;
  if (!fileUrl) {
    return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
  }

  const docId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO case_documents (id, case_id, uploaded_by, file_url, created_at)
     VALUES (@id, @case_id, @uploaded_by, @file_url, @created_at)`
  ).run({
    id: docId,
    case_id: params.id,
    uploaded_by: user.id,
    file_url: fileUrl,
    created_at: new Date().toISOString(),
  });

  const created = db.prepare("SELECT * FROM case_documents WHERE id = ?").get(docId);
  return NextResponse.json({ document: created });
}
