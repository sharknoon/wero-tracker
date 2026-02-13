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
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"aliases" json DEFAULT '[]'::json NOT NULL,
	"wero_support" "support_statuses" NOT NULL,
	"countries" json DEFAULT '[]'::json NOT NULL,
	"logo_url" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "banking_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon_url" text NOT NULL,
	"universal_link" text NOT NULL,
	"supports_desktop" boolean NOT NULL,
	"wero_support" "support_statuses" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand_id" text NOT NULL,
	"website" text NOT NULL,
	"bank_context" text,
	"aliases" json DEFAULT '[]'::json NOT NULL,
	"countries" json DEFAULT '[]'::json NOT NULL,
	"logo_url" text,
	"standalone_app_support" "support_statuses" NOT NULL,
	"p2p_payments_support" "support_statuses" NOT NULL,
	"e_commerce_payments_support" "support_statuses" NOT NULL,
	"pos_payments_support" "support_statuses" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banks_to_banking_apps" (
	"bank_id" text NOT NULL,
	"banking_app_id" text NOT NULL,
	CONSTRAINT "banks_to_banking_apps_bank_id_banking_app_id_pk" PRIMARY KEY("bank_id","banking_app_id")
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
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banks" ADD CONSTRAINT "banks_brand_id_bank_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."bank_brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banks_to_banking_apps" ADD CONSTRAINT "banks_to_banking_apps_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banks_to_banking_apps" ADD CONSTRAINT "banks_to_banking_apps_banking_app_id_banking_apps_id_fk" FOREIGN KEY ("banking_app_id") REFERENCES "public"."banking_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "banks_brandId_idx" ON "banks" USING btree ("brand_id");