"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Contribution,
  ContributionAction,
  ContributionPayload,
} from "@/lib/contribution-types";
import { BankBrand, MerchantBrand } from "@/lib/schema";

interface ContributionContextState {
  // Dialog state
  isDialogOpen: boolean;
  dialogType: "bank-brand" | "merchant" | null;
  dialogAction: ContributionAction | null;

  // Existing entity data for edit/delete
  existingBankBrand: BankBrand | null;
  existingMerchant: MerchantBrand | null;
}

interface ContributionContextActions {
  // Open dialogs
  openAddBankBrandDialog: () => void;
  openEditBankBrandDialog: (brand: BankBrand) => void;
  openDeleteBankBrandDialog: (brand: BankBrand) => void;

  openAddMerchantDialog: () => void;
  openEditMerchantDialog: (merchant: MerchantBrand) => void;
  openDeleteMerchantDialog: (merchant: MerchantBrand) => void;

  // Close dialog
  closeDialog: () => void;

  // Submit contribution
  submitContribution: (contribution: Contribution) => void;
}

type ContributionContextValue = ContributionContextState &
  ContributionContextActions;

const ContributionContext = createContext<ContributionContextValue | null>(
  null,
);

export function ContributionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ContributionContextState>({
    isDialogOpen: false,
    dialogType: null,
    dialogAction: null,
    existingBankBrand: null,
    existingMerchant: null,
  });

  // Bank Brand dialogs
  const openAddBankBrandDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "bank-brand",
      dialogAction: "add",
      existingBankBrand: null,
      existingMerchant: null,
    }));
  }, []);

  const openEditBankBrandDialog = useCallback((brand: BankBrand) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "bank-brand",
      dialogAction: "edit",
      existingBankBrand: brand,
      existingMerchant: null,
    }));
  }, []);

  const openDeleteBankBrandDialog = useCallback((brand: BankBrand) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "bank-brand",
      dialogAction: "delete",
      existingBankBrand: brand,
      existingMerchant: null,
    }));
  }, []);

  // Merchant dialogs
  const openAddMerchantDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "merchant",
      dialogAction: "add",
      existingBankBrand: null,
      existingMerchant: null,
    }));
  }, []);

  const openEditMerchantDialog = useCallback((merchant: MerchantBrand) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "merchant",
      dialogAction: "edit",
      existingBankBrand: null,
      existingMerchant: merchant,
    }));
  }, []);

  const openDeleteMerchantDialog = useCallback((merchant: MerchantBrand) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: true,
      dialogType: "merchant",
      dialogAction: "delete",
      existingBankBrand: null,
      existingMerchant: merchant,
    }));
  }, []);

  // Close dialog
  const closeDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: false,
      dialogType: null,
      dialogAction: null,
      existingBankBrand: null,
      existingMerchant: null,
    }));
  }, []);

  // Submit contribution
  const submitContribution = useCallback((contribution: Contribution) => {
    // Create the payload
    const payload: ContributionPayload = {
      contribution,
      timestamp: new Date().toISOString(),
    };

    const issueTitle = generateIssueTitle(contribution);
    const issueBody = generateIssueBody(payload);

    const repoUrl =
      process.env.NEXT_PUBLIC_WEBSITE_SOURCE_REPOSITORY ||
      "https://github.com/user/repo";
    const issueUrl = `${repoUrl}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=contribution`;

    // Open the issue creation page in a new tab
    window.open(issueUrl, "_blank");
  }, []);

  const value: ContributionContextValue = {
    ...state,
    openAddBankBrandDialog,
    openEditBankBrandDialog,
    openDeleteBankBrandDialog,
    openAddMerchantDialog,
    openEditMerchantDialog,
    openDeleteMerchantDialog,
    closeDialog,
    submitContribution,
  };

  return (
    <ContributionContext.Provider value={value}>
      {children}
    </ContributionContext.Provider>
  );
}

export function useContribution() {
  const context = useContext(ContributionContext);
  if (!context) {
    throw new Error(
      "useContribution must be used within a ContributionProvider",
    );
  }
  return context;
}

// Helper functions to generate issue content
function generateIssueTitle(contribution: Contribution): string {
  const actionLabels = {
    add: "Add",
    edit: "Update",
    delete: "Remove",
  };

  const typeLabels = {
    "bank-brand": "Bank",
    merchant: "Merchant",
  };

  const action = actionLabels[contribution.action];
  const type = typeLabels[contribution.type];
  const name = contribution.data.name || "Unknown";

  return `[Contribution] ${action} ${type}: ${name}`;
}

function generateIssueBody(payload: {
  contribution: Contribution;
  timestamp: string;
}): string {
  const { contribution, timestamp } = payload;

  let body = `## Contribution Request\n\n`;
  body += `**Type:** ${contribution.type}\n`;
  body += `**Action:** ${contribution.action}\n`;
  body += `**Submitted:** ${new Date(timestamp).toLocaleString()}\n\n`;

  if (contribution.reason) {
    body += `### Reason\n${contribution.reason}\n\n`;
  }

  body += `### Data\n\n`;
  body += "```json\n";
  body += JSON.stringify(contribution.data, null, 2);
  body += "\n```\n\n";

  body += `---\n`;
  body += `<!-- CONTRIBUTION_DATA:${btoa(JSON.stringify(payload))} -->\n`;

  return body;
}
