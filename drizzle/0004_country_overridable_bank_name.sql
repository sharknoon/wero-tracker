ALTER TABLE "banks" ALTER COLUMN "name" SET DATA TYPE json USING json_build_object('default', "name");--> statement-breakpoint
UPDATE "contributions"
SET "data" = jsonb_set("data"::jsonb, '{name}', jsonb_build_object('default', "data"->>'name'))::json
WHERE "type" = 'bank' AND jsonb_typeof("data"::jsonb->'name') = 'string';--> statement-breakpoint
UPDATE "contributions"
SET "previous_data" = jsonb_set("previous_data"::jsonb, '{name}', jsonb_build_object('default', "previous_data"->>'name'))::json
WHERE "type" = 'bank' AND jsonb_typeof("previous_data"::jsonb->'name') = 'string';