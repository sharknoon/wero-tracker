import { getAllBanks } from "@/actions/bank-actions";
import { getAllMerchants } from "@/actions/merchant-actions";
import { WeroTracker } from "@/components/wero-tracker";
import { db } from "@/db";
import { banks } from "@/db/schema/banks";
import { merchants } from "@/db/schema/merchants";
import { calculateWeroSupport } from "@/lib/bank-helper";
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

async function getWeroData() {
  "use cache";
  cacheLife("hours");
  cacheTag("wero-data");

  const [banksData, merchantsData, lastUpdated] = await Promise.all([
    getAllBanks(),
    getAllMerchants(),
    db
      .execute<{ latest: string }>(
        sql`
          SELECT greatest(
            (SELECT max(${banks.updatedAt}) FROM ${banks}),
            (SELECT max(${merchants.updatedAt}) FROM ${merchants})
          ) AS latest
        `,
      )
      .then((r) => new Date(r.rows[0].latest)),
  ]);

  return {
    banks: banksData.map((bank) => ({
      ...bank,
      weroSupport: calculateWeroSupport(bank),
    })),
    merchants: merchantsData,
    lastUpdated,
  };
}

export type WeroData = Awaited<ReturnType<typeof getWeroData>>;

export default async function Page() {
  const data = await getWeroData();

  return <WeroTracker data={data} />;
}
