import { Bank } from "@/db/schema/banks";
import { SupportStatus } from "@/db/schema/support";
import { baseStatus } from "@/lib/status-helper";

export function calculateWeroSupport(
  bank: Pick<
    Bank,
    "p2pPaymentsSupport" | "eCommercePaymentsSupport" | "posPaymentsSupport"
  >,
  countryCode: string,
): SupportStatus {
  const statuses = [
    bank.p2pPaymentsSupport[countryCode] || bank.p2pPaymentsSupport.default,
    bank.eCommercePaymentsSupport[countryCode] ||
      bank.eCommercePaymentsSupport.default,
    bank.posPaymentsSupport[countryCode] || bank.posPaymentsSupport.default,
  ].map((s) => [baseStatus(s), s] as const);
  for (const status of ["supported", "announced", "unsupported"] as const) {
    for (const [base, original] of statuses) {
      if (base === status) return original;
    }
  }
  return "unknown";
}

/** A bank with overrides resolved for a specific country. */
export type ResolvedBank = Omit<
  Bank,
  | "name"
  | "website"
  | "p2pPaymentsSupport"
  | "eCommercePaymentsSupport"
  | "posPaymentsSupport"
  | "standaloneAppSupport"
  | "bankingApps"
  | "notes"
> & {
  name: string;
  website: string;
  p2pPaymentsSupport: SupportStatus;
  eCommercePaymentsSupport: SupportStatus;
  posPaymentsSupport: SupportStatus;
  standaloneAppSupport: SupportStatus;
  bankingApps: (Omit<
    Bank["bankingApps"][number],
    "weroSupport" | "universalLink"
  > & {
    weroSupport: SupportStatus;
    universalLink: string;
  })[];
  notes: string | null;
  weroSupport: SupportStatus;
};

/**
 * Merge base bank fields with per-country overrides.
 * For `bankingApps`, a country override fully replaces the base array.
 */
export function resolveBank(bank: Bank, countryCode: string): ResolvedBank {
  return {
    ...bank,
    name: bank.name[countryCode] ?? bank.name.default,
    website: bank.website[countryCode] ?? bank.website.default,
    p2pPaymentsSupport:
      bank.p2pPaymentsSupport[countryCode] ?? bank.p2pPaymentsSupport.default,
    eCommercePaymentsSupport:
      bank.eCommercePaymentsSupport[countryCode] ??
      bank.eCommercePaymentsSupport.default,
    posPaymentsSupport:
      bank.posPaymentsSupport[countryCode] ?? bank.posPaymentsSupport.default,
    standaloneAppSupport:
      bank.standaloneAppSupport[countryCode] ??
      bank.standaloneAppSupport.default,
    bankingApps: bank.bankingApps
      .filter((a) => a.supportedCountries.includes(countryCode))
      .map((a) => ({
        ...a,
        weroSupport: a.weroSupport[countryCode] ?? a.weroSupport.default,
        universalLink: a.universalLink[countryCode] ?? a.universalLink.default,
      })),
    notes: bank.notes[countryCode] ?? bank.notes.default,
    weroSupport: calculateWeroSupport(bank, countryCode),
  };
}
