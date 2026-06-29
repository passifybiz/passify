CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(64) NOT NULL,
  webhook_secret VARCHAR(64) NOT NULL,
  base_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS kyc_providers_name_unique ON kyc_providers (name);

CREATE TABLE IF NOT EXISTS kyc_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_session_id VARCHAR(255) NOT NULL,
  provider_id UUID NOT NULL REFERENCES kyc_providers(id),
  user_pubkey VARCHAR(44) NOT NULL,
  schema_id VARCHAR(100) NOT NULL DEFAULT 'kyc_individual_v1',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_sessions_external ON kyc_sessions (external_session_id);
CREATE INDEX IF NOT EXISTS idx_kyc_sessions_pubkey ON kyc_sessions (user_pubkey);
CREATE INDEX IF NOT EXISTS idx_kyc_sessions_status ON kyc_sessions (status);

CREATE TABLE IF NOT EXISTS attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attestation_id VARCHAR(255) NOT NULL,
  session_id UUID NOT NULL REFERENCES kyc_sessions(id),
  user_pubkey VARCHAR(44) NOT NULL,
  schema_id VARCHAR(100) NOT NULL,
  data_hash VARCHAR(64) NOT NULL,
  attester_pubkey VARCHAR(44) NOT NULL,
  onchain_tx VARCHAR(88) NOT NULL,
  onchain_account VARCHAR(44) NOT NULL,
  jurisdiction VARCHAR(8),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS attestations_attestation_id_unique ON attestations (attestation_id);
CREATE INDEX IF NOT EXISTS idx_attestations_pubkey ON attestations (user_pubkey);
CREATE INDEX IF NOT EXISTS idx_attestations_pubkey_expiry ON attestations (user_pubkey, expires_at);
CREATE INDEX IF NOT EXISTS idx_attestations_schema ON attestations (schema_id);

CREATE TABLE IF NOT EXISTS mint_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mint_address VARCHAR(44) NOT NULL,
  decimals SMALLINT NOT NULL DEFAULT 6,
  total_supply NUMERIC(24,0) NOT NULL,
  minted_supply NUMERIC(24,0) NOT NULL DEFAULT '0',
  is_confidential BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint_config_id UUID NOT NULL REFERENCES mint_configs(id),
  required_schema VARCHAR(100) NOT NULL,
  allowed_jurisdictions JSONB NOT NULL DEFAULT '[]',
  min_investment_usd NUMERIC(16,2) NOT NULL DEFAULT '0',
  max_holders INTEGER NOT NULL DEFAULT 999999,
  transfer_lock_until TIMESTAMPTZ,
  updated_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_compliance_rules_mint ON compliance_rules (mint_config_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  key_prefix VARCHAR(8) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free',
  monthly_limit INTEGER NOT NULL DEFAULT 500,
  current_usage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  allowed_mints JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS usage_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_usage INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attestation_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attestation_id VARCHAR(255) NOT NULL REFERENCES attestations(attestation_id),
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  read_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attestation_reads_att ON attestation_reads (attestation_id);
CREATE INDEX IF NOT EXISTS idx_attestation_reads_key ON attestation_reads (api_key_id);
