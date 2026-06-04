import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { createSession, hashPassword } from "../../../../lib/authServer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, password, role, college, certificateUrl, contactNumber } = body ?? {};

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (role === "student" && !college) {
    return NextResponse.json({ error: "College is required for students" }, { status: 400 });
  }
  if (role === "client" && !certificateUrl) {
    return NextResponse.json({ error: "BPL certificate is required for clients" }, { status: 400 });
  }

  const db = getDb();
  const passwordHash = await hashPassword(password);

  try {
    db.prepare(
      `INSERT INTO users (id, name, email, role, password_hash, created_at, bpl_certificate_url, college)
       VALUES (@id, @name, @email, @role, @password_hash, @created_at, @bpl_certificate_url, @college)`
    ).run({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      bpl_certificate_url: role === "client" ? certificateUrl : null,
      college: role === "student" ? college : null,
    });
    if (role === "lawyer" && contactNumber) {
      db.prepare("UPDATE users SET contact_number = ? WHERE email = ?").run(
        contactNumber,
        email
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    if (message.includes("UNIQUE")) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }

  const user = db
    .prepare("SELECT id, email, role FROM users WHERE email = ?")
    .get(email) as { id: string; email: string; role: "client" | "lawyer" | "student" };

  // Issue session cookie so refreshes keep login.
  createSession(user);
  return NextResponse.json({ user });
}
