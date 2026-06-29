import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { apiKeys, mintConfigs } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { parseJson } from "@/lib/db/json";
import { KeysClient } from "./client";
import type { KeyRow } from "./client";

export default async function KeysPage() {
  await requireUser();

  const rawKeys = await db.select().from(apiKeys).orderBy(sql`${apiKeys.createdAt} desc`);
  const keys: KeyRow[] = rawKeys.map((k: Record<string, unknown>) => ({
    ...k,
    allowedMints: parseJson<string[]>(k.allowedMints) ?? [],
  }));
  const mints = await db.select({ slug: mintConfigs.slug, name: mintConfigs.name }).from(mintConfigs);

  return <KeysClient keys={keys} mints={mints} />;
}
