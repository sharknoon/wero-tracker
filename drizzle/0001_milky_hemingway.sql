ALTER TABLE "banks" ALTER COLUMN "website" SET DATA TYPE json USING json_build_object('default', "website");--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "p2p_payments_support" SET DATA TYPE json USING json_build_object('default', "p2p_payments_support"::text);--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "e_commerce_payments_support" SET DATA TYPE json USING json_build_object('default', "e_commerce_payments_support"::text);--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "pos_payments_support" SET DATA TYPE json USING json_build_object('default', "pos_payments_support"::text);--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "standalone_app_support" SET DATA TYPE json USING json_build_object('default', "standalone_app_support"::text);--> statement-breakpoint
UPDATE "banks"
SET "banking_apps" = (
  SELECT COALESCE(json_agg(elem::jsonb || jsonb_build_object('supportedCountries', "countries"::jsonb)), '[]'::json)
  FROM json_array_elements("banking_apps") AS elem
)
WHERE json_array_length("banking_apps") > 0;--> statement-breakpoint
UPDATE "banks"
SET "banking_apps" = (
  SELECT COALESCE(json_agg(
    jsonb_set(
      elem::jsonb,
      '{universalLink}',
      jsonb_build_object('default', elem::jsonb->>'universalLink')
    )
  ), '[]'::json)
  FROM json_array_elements("banking_apps") AS elem
)
WHERE json_array_length("banking_apps") > 0;--> statement-breakpoint
UPDATE "banks"
SET "banking_apps" = (
  SELECT COALESCE(json_agg(
    jsonb_set(
      elem::jsonb,
      '{weroSupport}',
      jsonb_build_object('default', elem::jsonb->>'weroSupport')
    )
  ), '[]'::json)
  FROM json_array_elements("banking_apps") AS elem
)
WHERE json_array_length("banking_apps") > 0;--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "notes" SET DATA TYPE json USING json_build_object('default', "notes");--> statement-breakpoint
ALTER TABLE "banks" ALTER COLUMN "notes" SET NOT NULL;