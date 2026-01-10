import { MerchantBrand, BankBrand, Bank, BankingApp } from "./schema";

// Contribution action types
export type ContributionAction = "add" | "edit" | "delete";

// Base contribution with common fields
export interface BaseContribution {
  id: string;
  action: ContributionAction;
  reason?: string;
}

// Bank brand contribution - includes both brand data and banks data
export interface BankBrandContribution extends BaseContribution {
  type: "bank-brand";
  data: Omit<BankBrand, "id" | "banks" | "apps"> & {
    id: string | undefined;
    banks: (Omit<Bank, "id"> & {
      id: string | undefined;
    })[];
    apps: (Omit<BankingApp, "id"> & {
      id: string | undefined;
    })[];
  }; // Existing ID for edit/delete
}

// Merchant contribution
export interface MerchantContribution extends BaseContribution {
  type: "merchant";
  data: Omit<MerchantBrand, "id"> & {
    id: string | undefined;
  }; // Existing ID for edit/delete
}

// Union type for all contributions
export type Contribution = BankBrandContribution | MerchantContribution;

// Contribution submission payload
export interface ContributionPayload {
  contribution: Contribution;
  timestamp: string;
}
