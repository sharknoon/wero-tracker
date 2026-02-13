import { WeroTracker } from "@/components/wero-tracker";
import { db } from "@/db";
import { bankBrands, bankingApps, banks } from "@/db/schema/banks";
import { merchants } from "@/db/schema/merchants";
import { asc, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";

async function getWeroData() {
  "use cache";
  cacheLife("hours");

  const [bankBrandsData, merchantsData, lastUpdated] = await Promise.all([
    db.query.bankBrands.findMany({
      with: {
        banks: {
          with: {
            bankingAppsToBanks: {
              with: {
                bankingApp: true,
              },
            },
          },
        },
      },
      orderBy: (bb) => [asc(bb.name)],
    }),
    db.query.merchants.findMany({
      orderBy: (m) => [asc(m.name)],
    }),
    db
      .execute<{ latest: string }>(
        sql`
          SELECT greatest(
            (SELECT max(${bankBrands.updatedAt}) FROM ${bankBrands}),
            (SELECT max(${banks.updatedAt}) FROM ${banks}),
            (SELECT max(${bankingApps.updatedAt}) FROM ${bankingApps}),
            (SELECT max(${merchants.updatedAt}) FROM ${merchants})
          ) AS latest
        `,
      )
      .then((r) => new Date(r.rows[0].latest)),
  ]);
  console.log(typeof lastUpdated, lastUpdated);
  return {
    bankBrands: bankBrandsData,
    merchants: merchantsData,
    lastUpdated,
  };
}

export type WeroData = Awaited<ReturnType<typeof getWeroData>>;

export default async function Page() {
  const data = await getWeroData();

  return <WeroTracker data={data} />;
}
