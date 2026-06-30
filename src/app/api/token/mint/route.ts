import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { attestations, complianceRules, attestationReads } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateApiKey, resolveAllowedMint, errorResponse } from "@/lib/auth/api-key";
import { randomUUID } from "node:crypto";
import { tokenMintSchema, validateOr } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { readLimitedJson } from "@/lib/body-limit";
import { handleApiError } from "@/lib/errors";
import { withIdempotency } from "@/lib/idempotency";

export async function POST(req: NextRequest) {
  try {
    const key = await authenticateApiKey(req);

    return await withIdempotency(req, key.id, async () => {
      const body = await readLimitedJson(req);
      const { data, errorResponse: validationError } = validateOr(tokenMintSchema, body);
      if (validationError) return validationError;

      if (key.isTest) {
        const { testMintResult } = await import("@/lib/test-mode");
        return NextResponse.json(testMintResult(data!.mint_config, Number(data!.amount)));
      }

      const config = await resolveAllowedMint(data!.mint_config, key);
      const rule = await db.query.complianceRules.findFirst({
        where: eq(complianceRules.mintConfigId, config.id),
      });

      const att = await db.query.attestations.findFirst({
        where: and(
          eq(attestations.userPubkey, data!.user_pubkey),
          sql`${attestations.expiresAt} > ${new Date().toISOString()}`
        ),
        orderBy: sql`${attestations.createdAt} desc`,
      });

      if (!att) {
        return errorResponse(403, "attestation_required", "User has no valid attestation.");
      }

      if (rule && rule.requiredSchema !== att.schemaId) {
        const { schemaSatisfies } = await import("@/lib/schemas/registry");
        if (!schemaSatisfies(att.schemaId, rule.requiredSchema)) {
          return errorResponse(403, "rule_violation", `Schema mismatch: required ${rule.requiredSchema}`);
        }
      }

      const amount = Number(data!.amount);
      if (rule && amount < Number(rule.minInvestmentUsd)) {
        return errorResponse(403, "rule_violation", `Minimum investment is $${rule.minInvestmentUsd}`);
      }

      if (rule && rule.transferLockUntil && new Date(rule.transferLockUntil) > new Date()) {
        return errorResponse(403, "rule_violation", "Transfers are locked until " + rule.transferLockUntil);
      }

      await db.insert(attestationReads).values({
        id: randomUUID(),
        attestationId: att.attestationId,
        apiKeyId: key.id,
      });

      const { getTokenService } = await import("@/lib/providers/factory");
      const tokenService = await getTokenService();
      const tx = await tokenService.buildMint({
        mintAddress: config.mintAddress,
        decimals: config.decimals,
        recipient: data!.user_pubkey,
        amount,
      });

      logger.info("token_minted", { platformId: key.id, mint: config.mintAddress, amount });

      return NextResponse.json({
        status: "success",
        unsigned_transaction_base64: tx.unsignedTransactionBase64,
        mint: config.mintAddress,
        amount,
      });
    });
  } catch (e) {
    logger.error("token_mint_error", { error: String(e) });
    return handleApiError(e);
  }
}
