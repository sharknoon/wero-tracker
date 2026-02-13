CREATE TABLE "banking_apps_to_banks" (
	"bank_id" text NOT NULL,
	"app_id" text NOT NULL,
	CONSTRAINT "banking_apps_to_banks_bank_id_app_id_pk" PRIMARY KEY("bank_id","app_id")
);
--> statement-breakpoint
ALTER TABLE "banking_apps" DROP CONSTRAINT "banking_apps_brand_id_bank_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "banking_apps_to_banks" ADD CONSTRAINT "banking_apps_to_banks_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banking_apps_to_banks" ADD CONSTRAINT "banking_apps_to_banks_app_id_banking_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."banking_apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banking_apps" DROP COLUMN "brand_id";--> statement-breakpoint
ALTER TABLE "banks" DROP COLUMN "app_ids";