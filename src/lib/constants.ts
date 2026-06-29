export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_SECRET_MIN_LENGTH = 16;

export const KYC_SESSION_EXPIRY_SECONDS = 60 * 30;
export const ATTESTATION_EXPIRY_DAYS = 180;

export const LOGIN_RATE_LIMIT = { max: 5, windowSeconds: 300 };
export const KYC_START_RATE_LIMIT = { max: 20, windowSeconds: 60 };

export const TIER_LIMITS: Record<string, number> = {
  free: 500,
  pro: 10000,
  enterprise: 999999,
};

export const API_KEY_PREFIX = "passify_";

export const BODY_LIMIT_DEFAULT = 1024 * 100;
export const BODY_LIMIT_WEBHOOK = 512 * 1024;
