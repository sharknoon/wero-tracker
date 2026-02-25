import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/db/schema/auth";
import * as banksSchema from "@/db/schema/banks";
import * as merchantsSchema from "@/db/schema/merchants";
import * as supportSchema from "@/db/schema/support";
import * as contributionsSchema from "@/db/schema/contributions";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    ...authSchema,
    ...banksSchema,
    ...merchantsSchema,
    ...supportSchema,
    ...contributionsSchema,
  },
});
