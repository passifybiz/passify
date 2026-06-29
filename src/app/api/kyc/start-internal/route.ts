import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { kycProviders, kycSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { getKycProvider } from "@/lib/providers/factory";
import { kycStartSchema, validateOr } from "@/lib/validation";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { KYC_SESSION_EXPIRY_SECONDS } from "@/lib/constants";

/** Dashboard-facing KYC start — uses session auth (not API key). */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await readLimitedJson(req);
    const { data, errorResponse } = validateOr(kycStartSchema, body);
    if (errorResponse) return errorResponse;

    const provider = await getKycProvider();
    const started = await provider.startSession({ userPubkey: data!.userPubkey, schemaId: data!.schemaId });

    const providerRow = await db.query.kycProviders.findFirst({ where: eq(kycProviders.name, started.providerName) });
    if (providerRow) {
      await db.insert(kycSessions).values({
        id: randomUUID(),
        externalSessionId: started.externalSessionId,
        providerId: providerRow.id,
        userPubkey: data!.userPubkey,
        schemaId: data!.schemaId,
        status: "pending",
        expiresAt: new Date(Date.now() + KYC_SESSION_EXPIRY_SECONDS * 1000).toISOString(),
      });
    }

    return NextResponse.json({ session_id: started.externalSessionId, session_url: started.sessionUrl });
  } catch (e) {
    return handleApiError(e);
  }
}
