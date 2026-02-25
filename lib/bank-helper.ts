import { Bank } from "@/db/schema/banks";
import { SupportStatus } from "@/db/schema/support";

export function calculateWeroSupport(bank: Bank): SupportStatus {
  const statuses = [
    bank.p2pPaymentsSupport,
    bank.eCommercePaymentsSupport,
    bank.posPaymentsSupport,
  ];
  for (const status of ["supported", "announced", "unsupported"] as const) {
    if (statuses.includes(status)) return status;
  }
  return "unknown";
}
