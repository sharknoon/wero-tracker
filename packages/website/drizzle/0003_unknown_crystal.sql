ALTER TABLE "bank_brands" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_brands" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "banking_apps" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "banking_apps" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "banks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "banks" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "bank_brands_updated_at_idx" ON "bank_brands" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "banking_apps_updated_at_idx" ON "banking_apps" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "banks_updated_at_idx" ON "banks" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "merchants_updated_at_idx" ON "merchants" USING btree ("updated_at");