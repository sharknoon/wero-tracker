import { WeroTracker } from "@/components/wero-tracker"
import { sampleWeroData } from "@/lib/sample-data"

// In production, this would fetch from a GitHub raw URL
// Example: https://raw.githubusercontent.com/your-org/wero-tracker-data/main/data.json
async function getWeroData() {
  // For now, return sample data
  // In production, you would fetch from GitHub:
  // const res = await fetch('https://raw.githubusercontent.com/community/wero-tracker-data/main/data.json', {
  //   next: { revalidate: 3600 } // Revalidate every hour
  // });
  // return res.json();
  return sampleWeroData
}

export default async function Page() {
  const data = await getWeroData()

  return <WeroTracker data={data} />
}
