ALTER TABLE "banks_to_banking_apps" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "banks_to_banking_apps" CASCADE;--> statement-breakpoint
ALTER TABLE "banking_apps" ADD COLUMN "brand_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "banks" ADD COLUMN "app_ids" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "banking_apps" ADD CONSTRAINT "banking_apps_brand_id_bank_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."bank_brands"("id") ON DELETE cascade ON UPDATE no action;