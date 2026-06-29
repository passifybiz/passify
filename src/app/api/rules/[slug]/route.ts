import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mintConfigs, complianceRules, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { requireWriteAccess } from "@/lib/auth/rbac";
import { parseJson } from "@/lib/db/json";
import { randomUUID } from "node:crypto";
import { readLimitedJson } from "@/lib/body-limit";
import { updateRulesSchema, validateOr } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { session, errorResponse: authError } = await requireWriteAccess();
  if (authError) return authError;

  try {
    const config = await db.query.mintConfigs.findFirst({ where: eq(mintConfigs.slug, slug) });
    if (!config) {
      return NextResponse.json({ error: "not_found", detail: "Mint config not found." }, { status: 404 });
    }

    const raw = await readLimitedJson(req);
    const { data, errorResponse: validationError } = validateOr(updateRulesSchema, raw);
    if (validationError) return validationError;

    const existing = await db.query.complianceRules.findFirst({
      where: eq(complianceRules.mintConfigId, config.id),
    });

    const updateData: Record<string, unknown> = {
      updatedBy: session.email,
      updatedAt: new Date().toISOString(),
    };
    if (data!.requiredSchema !== undefined) updateData.requiredSchema = data!.requiredSchema;
    if (data!.allowedJurisdictions !== undefined) updateData.allowedJurisdictions = JSON.stringify(data!.allowedJurisdictions);
    if (data!.minInvestmentUsd !== undefined) updateData.minInvestmentUsd = String(data!.minInvestmentUsd);
    if (data!.maxHolders !== undefined) updateData.maxHolders = data!.maxHolders;
    if (data!.transferLockUntil !== undefined) updateData.transferLockUntil = data!.transferLockUntil;

    if (existing) {
      const oldValue = {
        requiredSchema: existing.requiredSchema,
        allowedJurisdictions: parseJson(existing.allowedJurisdictions),
        minInvestmentUsd: existing.minInvestmentUsd,
        maxHolders: existing.maxHolders,
      };
      await db.update(complianceRules)
        .set(updateData)
        .where(eq(complianceRules.id, existing.id));

      await db.insert(auditLog).values({
        actor: session.email,
        action: "rule_updated",
        entityType: "compliance_rule",
        entityId: existing.id,
        oldValue: JSON.stringify(oldValue),
        newValue: JSON.stringify(updateData),
        ipAddress: null,
      });
    } else {
      const [newRule] = await db.insert(complianceRules).values({
        id: randomUUID(),
        mintConfigId: config.id,
        requiredSchema: data!.requiredSchema ?? "kyc_individual_v1",
        allowedJurisdictions: JSON.stringify(data!.allowedJurisdictions ?? []),
        minInvestmentUsd: String(data!.minInvestmentUsd ?? "0"),
        maxHolders: data!.maxHolders ?? 999999,
        transferLockUntil: data!.transferLockUntil ? new Date(data!.transferLockUntil).toISOString() : null,
        updatedBy: session.email,
      }).returning();

      await db.insert(auditLog).values({
        actor: session.email,
        action: "rule_updated",
        entityType: "compliance_rule",
        entityId: newRule.id,
        newValue: JSON.stringify(updateData),
        ipAddress: null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
