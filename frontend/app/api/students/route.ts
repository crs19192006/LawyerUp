import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/authServer";
import { getDb } from "../../../lib/db";

export async function GET() {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "lawyer") {
    return NextResponse.json({ error: "Only lawyers can view students" }, { status: 403 });
  }

  const db = getDb();
  const students = db
    .prepare("SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name ASC")
    .all();

  return NextResponse.json({ students });
}
