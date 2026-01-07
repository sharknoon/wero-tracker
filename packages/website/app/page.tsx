import { WeroTracker } from "@/components/wero-tracker";
import { dataSchema } from "@/lib/schema";

async function getWeroData() {
  const dataUrl = process.env.NEXT_PUBLIC_WEBSITE_DATA_URL;
  if (!dataUrl) {
    throw new Error(
      "NEXT_PUBLIC_WEBSITE_DATA_URL environment variable is not set",
    );
  }
  const response = await fetch(dataUrl);
  const data = await response.json();
  return dataSchema.parse(data);
}

export default async function Page() {
  const data = await getWeroData();

  return <WeroTracker data={data} />;
}
