import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { createSession, verifyPassword } from "../../../../lib/authServer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, role, certificateUrl, college, contactNumber } = body ?? {};

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = getDb();
  const row = db
    .prepare("SELECT id, email, role, password_hash FROM users WHERE email = ?")
    .get(email) as
    | { id: string; email: string; role: "client" | "lawyer" | "student"; password_hash: string }
    | undefined;

  if (!row || row.role !== role) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (role === "student" && !college) {
    return NextResponse.json({ error: "College is required" }, { status: 400 });
  }
  if (role === "lawyer" && !contactNumber) {
    return NextResponse.json({ error: "Contact number is required" }, { status: 400 });
  }

  const isValid = await verifyPassword(password, row.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (role === "student" && college) {
    db.prepare("UPDATE users SET college = ? WHERE id = ?").run(college, row.id);
  }
  if (role === "lawyer" && contactNumber) {
    db.prepare("UPDATE users SET contact_number = ? WHERE id = ?").run(contactNumber, row.id);
  }

  const user = { id: row.id, email: row.email, role: row.role };
  createSession(user);
  return NextResponse.json({ user });
}
