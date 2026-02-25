"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";
import { WeroData } from "@/app/page";

type ContributionDialogOptions =
  | {
      type: "bank" | "merchant";
      action: "add";
    }
  | {
      type: "bank";
      action: "edit" | "delete";
      entity: WeroData["banks"][number];
    }
  | {
      type: "merchant";
      action: "edit" | "delete";
      entity: WeroData["merchants"][number];
    };

type OpenContributionDialogCallback = (
  options: ContributionDialogOptions,
) => void;

interface ContributionContextValue {
  openContributionDialog(options: ContributionDialogOptions): void;
  onOpenContributionDialog: (callback: OpenContributionDialogCallback) => void;
}

const ContributionContext = createContext<ContributionContextValue | null>(
  null,
);

export function ContributionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const callbacksRef = useRef<OpenContributionDialogCallback[]>([]);

  const openContributionDialog = useCallback(
    (options: ContributionDialogOptions) => {
      callbacksRef.current.forEach((callback) => {
        callback(options);
      });
    },
    [],
  );

  const onOpenContributionDialog = useCallback(
    (callback: OpenContributionDialogCallback) => {
      if (!callbacksRef.current.includes(callback)) {
        callbacksRef.current.push(callback);
      }
    },
    [],
  );

  const value: ContributionContextValue = React.useMemo(
    () => ({
      openContributionDialog,
      onOpenContributionDialog,
    }),
    [openContributionDialog, onOpenContributionDialog],
  );

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
