CREATE TYPE "public"."contribution_actions" AS ENUM('add', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."contribution_statuses" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."contribution_types" AS ENUM('bank-brand', 'merchant');--> statement-breakpoint
CREATE TYPE "public"."categories" AS ENUM('fashion', 'electronics', 'food-delivery', 'groceries', 'travel', 'entertainment', 'services', 'other');--> statement-breakpoint
CREATE TYPE "public"."support_statuses" AS ENUM('supported', 'announced', 'unsupported', 'unknown');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"aliases" json DEFAULT '[]'::json NOT NULL,
	"wero_support" "support_statuses" NOT NULL,
	"countries" json DEFAULT '[]'::json NOT NULL,
	"logo_url" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banking_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"icon_url" text NOT NULL,
	"universal_link" text NOT NULL,
	"supports_desktop" boolean NOT NULL,
	"wero_support" "support_statuses" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banking_apps_to_banks" (
	"bank_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	CONSTRAINT "banking_apps_to_banks_bank_id_app_id_pk" PRIMARY KEY("bank_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand_id" uuid NOT NULL,
	"website" text NOT NULL,
	"bank_context" text,
	"aliases" json DEFAULT '[]'::json NOT NULL,
	"countries" json DEFAULT '[]'::json NOT NULL,
	"logo_url" text,
	"standalone_app_support" "support_statuses" NOT NULL,
	"p2p_payments_support" "support_statuses" NOT NULL,
	"e_commerce_payments_support" "support_statuses" NOT NULL,
	"pos_payments_support" "support_statuses" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "contribution_types" NOT NULL,
	"action" "contribution_actions" NOT NULL,
	"status" "contribution_statuses" DEFAULT 'pending' NOT NULL,
	"data" json NOT NULL,
	"reason" text,
	"user_id" text NOT NULL,
	"reviewer_id" text,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"aliases" json DEFAULT '[]'::json NOT NULL,
	"website" text NOT NULL,
	"logo_url" text NOT NULL,
	"category" "categories" NOT NULL,
	"wero_support" "support_statuses" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banking_apps_to_banks" ADD CONSTRAINT "banking_apps_to_banks_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banking_apps_to_banks" ADD CONSTRAINT "banking_apps_to_banks_app_id_banking_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."banking_apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banks" ADD CONSTRAINT "banks_brand_id_bank_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."bank_brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "bank_brands_updated_at_idx" ON "bank_brands" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "banking_apps_updated_at_idx" ON "banking_apps" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "banks_brandId_idx" ON "banks" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "banks_updated_at_idx" ON "banks" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "contributions_status_idx" ON "contributions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contributions_type_idx" ON "contributions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "contributions_user_id_idx" ON "contributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contributions_created_at_idx" ON "contributions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "merchants_updated_at_idx" ON "merchants" USING btree ("updated_at");