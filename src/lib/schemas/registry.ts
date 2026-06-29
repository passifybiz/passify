// Attestation schemas Passify can issue. These are NOT the PII — they're the
// schema_id label written onchain + the metadata the attestation carries.
// Adding a schema is a code change (not a redeploy) — it lives in Postgres
// compliance_rules.required_schema and just needs to exist here as a known id.

export interface AttestationSchema {
  id: string;
  label: string;
  description: string;
}

export const SCHEMAS: AttestationSchema[] = [
  {
    id: "kyc_individual_v1",
    label: "KYC Individual v1",
    description: "Standard identity verification — name, DOB, document match.",
  },
  {
    id: "kyc_accredited_v1",
    label: "KYC Accredited v1",
    description: "Individual KYC plus accredited-investor qualification.",
  },
  {
    id: "kyc_entity_v1",
    label: "KYC Entity v1",
    description: "Corporate / entity KYC with beneficial-owner checks.",
  },
];

export const SCHEMA_IDS = SCHEMAS.map((s) => s.id);

export function schemaLabel(id: string): string {
  return SCHEMAS.find((s) => s.id === id)?.label ?? id;
}

// Schema compatibility: which schemas satisfy which required_schema.
// "kyc_accredited_v1" implies "kyc_individual_v1" (accredited superset).
const IMPLIES: Record<string, string[]> = {
  "kyc_accredited_v1": ["kyc_individual_v1", "kyc_accredited_v1"],
  "kyc_entity_v1": ["kyc_entity_v1"],
  "kyc_individual_v1": ["kyc_individual_v1"],
};

export function schemaSatisfies(held: string, required: string): boolean {
  return IMPLIES[held]?.includes(required) ?? false;
}
