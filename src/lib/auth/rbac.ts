import { getSession, type SessionPayload } from "./session";
import { NextResponse } from "next/server";

const WRITE_ROLES = ["admin", "compliance"];

export async function requireWriteAccess(): Promise<{ session: SessionPayload; errorResponse?: never } | { session?: never; errorResponse: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { errorResponse: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (!WRITE_ROLES.includes(session.role)) {
    return { errorResponse: NextResponse.json({ error: "forbidden", detail: "Insufficient permissions." }, { status: 403 }) };
  }
  return { session };
}
