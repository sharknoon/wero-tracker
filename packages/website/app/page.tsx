import { WeroTracker } from "@/components/wero-tracker";
import {
  bankBrandsSchema,
  merchantBrandsSchema,
  type Data,
} from "@/lib/schema";

async function getWeroData(): Promise<Data> {
  const banksUrl = process.env.NEXT_PUBLIC_WEBSITE_BANKS_URL;
  const merchantsUrl = process.env.NEXT_PUBLIC_WEBSITE_MERCHANTS_URL;

  if (!banksUrl) {
    throw new Error(
      "NEXT_PUBLIC_WEBSITE_BANKS_URL environment variable is not set",
    );
  }
  if (!merchantsUrl) {
    throw new Error(
      "NEXT_PUBLIC_WEBSITE_MERCHANTS_URL environment variable is not set",
    );
  }

  const [banksResponse, merchantsResponse] = await Promise.all([
    fetch(banksUrl),
    fetch(merchantsUrl),
  ]);

  const banksData = bankBrandsSchema.parse(await banksResponse.json());
  const merchantsData = merchantBrandsSchema.parse(
    await merchantsResponse.json(),
  );

  return {
    banks: banksData,
    merchants: merchantsData,
  };
}

export default async function Page() {
  const data = await getWeroData();

  return <WeroTracker data={data} />;
}
