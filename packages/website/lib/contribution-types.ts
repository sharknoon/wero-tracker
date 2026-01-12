import { MerchantBrand, BankBrand } from "./schema";

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
  data: BankBrand;
}

// Merchant contribution
export interface MerchantContribution extends BaseContribution {
  type: "merchant";
  data: MerchantBrand;
}

// Union type for all contributions
export type Contribution = BankBrandContribution | MerchantContribution;

// Contribution submission payload
export interface ContributionPayload {
  contribution: Contribution;
  timestamp: string;
}
