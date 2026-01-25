import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/authServer";

export async function GET() {
  const user = getSessionUser();
  return NextResponse.json({ user });
}
