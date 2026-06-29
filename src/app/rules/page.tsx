import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mintConfigs, complianceRules } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseJson } from "@/lib/db/json";
import { RulesClient } from "./client";
import type { MintRow } from "./client";

export default async function RulesPage() {
  await requireUser();

  const mints = await db.select().from(mintConfigs).orderBy(sql`${mintConfigs.createdAt} desc`);
  const rules = await db.select().from(complianceRules);

  const mintsWithRules: MintRow[] = mints.map((m) => {
    const rule = rules.find((r) => r.mintConfigId === m.id);
    return {
      mint: m,
      rule: rule ? {
        ...rule,
        allowedJurisdictions: parseJson<string[]>(rule.allowedJurisdictions) ?? [],
      } : null,
    };
  });

  return <RulesClient mints={mintsWithRules} />;
}
