import { z } from "zod";
import { SCHEMA_IDS } from "@/lib/schemas/registry";
import { NextResponse } from "next/server";

const solanaPubkey = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/, "Invalid Solana public key");

export const kycStartSchema = z.object({
  userPubkey: solanaPubkey,
  schemaId: z.enum(SCHEMA_IDS as [string, ...string[]]),
});

export const kycStatusSchema = z.object({
  pubkey: solanaPubkey,
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256),
});

export const createApiKeySchema = z.object({
  platformName: z.string().min(1).max(100),
  tier: z.enum(["free", "pro", "enterprise"]).default("free"),
  allowedMints: z.array(z.string()).default([]),
  mode: z.enum(["live", "test"]).default("live"),
});

export const patchApiKeySchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export const tokenMintSchema = z.object({
  user_pubkey: solanaPubkey,
  mint_config: z.string().min(1).max(100),
  amount: z.union([z.string(), z.number()]).refine((v) => Number(v) > 0, "Amount must be positive"),
});

export const tokenTransferSchema = z.object({
  mint_config: z.string().min(1).max(100),
  sender: solanaPubkey,
  recipient: solanaPubkey,
  amount: z.union([z.string(), z.number()]).refine((v) => Number(v) > 0, "Amount must be positive"),
});

export const createWebhookSchema = z.object({
  url: z.string().url().max(2048),
  description: z.string().max(255).optional(),
  events: z.array(z.string()).min(1, "Subscribe to at least one event"),
});

export const patchWebhookSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
  events: z.array(z.string()).min(1).optional(),
  rotateSecret: z.boolean().optional(),
});

export const deleteWebhookSchema = z.object({
  id: z.string().uuid(),
});

export const replayWebhookSchema = z.object({
  deliveryId: z.string().uuid(),
});

export const updateRulesSchema = z.object({
  requiredSchema: z.enum(SCHEMA_IDS as [string, ...string[]]).optional(),
  allowedJurisdictions: z.array(z.string().length(2)).optional(),
  minInvestmentUsd: z.union([z.string(), z.number()]).optional(),
  maxHolders: z.number().int().positive().optional(),
  transferLockUntil: z.string().datetime().optional(),
});

export function validateOr<T>(schema: z.ZodSchema<T>, data: unknown): { data?: T; errorResponse?: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      errorResponse: NextResponse.json(
        { error: "validation_error", detail: `${first?.path.join(".")}: ${first?.message}` },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}
