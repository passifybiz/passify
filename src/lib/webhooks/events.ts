/**
 * Supported outbound webhook event types. A subscription of `"*"` matches all.
 */
export const WEBHOOK_EVENT_TYPES = [
  "attestation.issued",
  "attestation.expiring",
  "kyc.status_changed",
  "rule.updated",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export function isWebhookEventType(v: string): v is WebhookEventType {
  return (WEBHOOK_EVENT_TYPES as readonly string[]).includes(v);
}

/** Does an endpoint's subscription list match a given event type? */
export function subscriptionMatches(subscribed: string[], type: string): boolean {
  return subscribed.includes("*") || subscribed.includes(type);
}

export const WEBHOOK_EVENT_DESCRIPTIONS: Record<WebhookEventType, string> = {
  "attestation.issued": "A new on-chain attestation was issued for a wallet.",
  "attestation.expiring": "An attestation is within its expiry window and should be renewed.",
  "kyc.status_changed": "A KYC session changed status (e.g. approved, rejected, expired).",
  "rule.updated": "A compliance rule for a mint configuration was changed.",
};
