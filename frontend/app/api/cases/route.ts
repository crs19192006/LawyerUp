import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/authServer";
import { getDb } from "../../../lib/db";
import { getComplexityTag, scoreCaseDescription } from "../../../lib/scoring";

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Ownership checks keep cases isolated per user role.
  if (user.role === "client") {
    const cases = db
      .prepare(
        `SELECT c.*, u.name AS lawyer_name, u.email AS lawyer_email, u.contact_number AS lawyer_contact_number
         FROM cases c
         LEFT JOIN users u ON u.id = c.assigned_lawyer_id
         WHERE c.client_id = ?`
      )
      .all(user.id);
    return NextResponse.json({ cases });
  }

  if (user.role === "lawyer") {
    // Marketplace visibility: lawyers can see open cases + their own accepted cases.
    const openCases = db
      .prepare(
        `SELECT c.*, u.name AS client_name, u.email AS client_email,
                u.bpl_certificate_url AS client_bpl_certificate_url
         FROM cases c
         JOIN users u ON u.id = c.client_id
         WHERE c.assigned_lawyer_id IS NULL`
      )
      .all();
    const myCases = db
      .prepare(
        `SELECT c.*, u.name AS client_name, u.email AS client_email,
                u.bpl_certificate_url AS client_bpl_certificate_url
         FROM cases c
         JOIN users u ON u.id = c.client_id
         WHERE c.assigned_lawyer_id = ?`
      )
      .all(user.id);
    return NextResponse.json({ openCases, myCases });
  }

  return NextResponse.json({ cases: [] });
}

export async function POST(request: Request) {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "client") {
    return NextResponse.json({ error: "Only clients can create cases" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, description, category } = body ?? {};

  if (!title || !description || !category) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const score = scoreCaseDescription(description);
  const caseId = crypto.randomUUID();
  const db = getDb();

  db.prepare(
    `INSERT INTO cases (
      id, client_id, assigned_lawyer_id, title, description, category,
      difficulty_score, complexity_tag, status, created_at
    ) VALUES (
      @id, @client_id, @assigned_lawyer_id, @title, @description, @category,
      @difficulty_score, @complexity_tag, @status, @created_at
    )`
  ).run({
    id: caseId,
    client_id: user.id,
    assigned_lawyer_id: null,
    title,
    description,
    category,
    difficulty_score: score,
    complexity_tag: getComplexityTag(score),
    status: "Created",
    created_at: new Date().toISOString(),
  });

  const created = db.prepare("SELECT * FROM cases WHERE id = ?").get(caseId);
  return NextResponse.json({ case: created });
}
