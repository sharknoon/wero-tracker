ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-bizum' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-bancomat' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-mb-way' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-vipps' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-mobilepay' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-blik' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'supported-via-iris' BEFORE 'announced';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-bizum' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-bancomat' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-mb-way' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-vipps' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-mobilepay' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-blik' BEFORE 'unsupported';--> statement-breakpoint
ALTER TYPE "public"."support_statuses" ADD VALUE 'announced-via-iris' BEFORE 'unsupported';