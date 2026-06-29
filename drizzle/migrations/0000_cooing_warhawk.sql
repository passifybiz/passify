CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'admin' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_name" varchar(100) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"key_prefix" varchar(8) NOT NULL,
	"tier" varchar(20) DEFAULT 'free' NOT NULL,
	"monthly_limit" integer DEFAULT 500 NOT NULL,
	"current_usage" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"allowed_mints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "attestation_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attestation_id" varchar(255) NOT NULL,
	"api_key_id" uuid NOT NULL,
	"readAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attestations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attestation_id" varchar(255) NOT NULL,
	"session_id" uuid NOT NULL,
	"user_pubkey" varchar(44) NOT NULL,
	"schema_id" varchar(100) NOT NULL,
	"data_hash" varchar(64) NOT NULL,
	"attester_pubkey" varchar(44) NOT NULL,
	"onchain_tx" varchar(88) NOT NULL,
	"onchain_account" varchar(44) NOT NULL,
	"jurisdiction" varchar(8),
	"expires_at" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attestations_attestation_id_unique" UNIQUE("attestation_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" "inet",
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mint_config_id" uuid NOT NULL,
	"required_schema" varchar(100) NOT NULL,
	"allowed_jurisdictions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_investment_usd" numeric(16, 2) DEFAULT '0' NOT NULL,
	"max_holders" integer DEFAULT 999999 NOT NULL,
	"transfer_lock_until" timestamp with time zone,
	"updated_by" varchar(255) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"api_key_hash" varchar(64) NOT NULL,
	"webhook_secret" varchar(64) NOT NULL,
	"base_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_session_id" varchar(255) NOT NULL,
	"provider_id" uuid NOT NULL,
	"user_pubkey" varchar(44) NOT NULL,
	"schema_id" varchar(100) DEFAULT 'kyc_individual_v1' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_detail" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "kyc_sessions_external_unique" UNIQUE("external_session_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE "mint_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"mint_address" varchar(44) NOT NULL,
	"decimals" smallint DEFAULT 6 NOT NULL,
	"total_supply" numeric(24, 0) NOT NULL,
	"minted_supply" numeric(24, 0) DEFAULT '0' NOT NULL,
	"is_confidential" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"resetAt" timestamp with time zone DEFAULT now() NOT NULL,
	"previous_usage" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attestation_reads" ADD CONSTRAINT "attestation_reads_attestation_id_attestations_attestation_id_fk" FOREIGN KEY ("attestation_id") REFERENCES "public"."attestations"("attestation_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attestation_reads" ADD CONSTRAINT "attestation_reads_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_session_id_kyc_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."kyc_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_rules" ADD CONSTRAINT "compliance_rules_mint_config_id_mint_configs_id_fk" FOREIGN KEY ("mint_config_id") REFERENCES "public"."mint_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_sessions" ADD CONSTRAINT "kyc_sessions_provider_id_kyc_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."kyc_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_resets" ADD CONSTRAINT "usage_resets_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attestation_reads_att_key" ON "attestation_reads" USING btree ("attestation_id","api_key_id","readAt");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attestations_pubkey_schema" ON "attestations" USING btree ("user_pubkey","schema_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_audit_log_entity" ON "audit_log" USING btree ("entity_type","entity_id","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_compliance_rules_mint" ON "compliance_rules" USING btree ("mint_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kyc_providers_name_unique" ON "kyc_providers" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_kyc_sessions_external" ON "kyc_sessions" USING btree ("external_session_id");