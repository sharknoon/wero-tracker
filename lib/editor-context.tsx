"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";
import { Bank } from "@/db/schema/banks";
import { Merchant } from "@/db/schema/merchants";

type EditorDialogOptions = (
  | {
      type: "bank" | "merchant";
      action: "add";
    }
  | {
      type: "bank";
      action: "edit" | "delete";
      entity: Bank;
    }
  | {
      type: "merchant";
      action: "edit" | "delete";
      entity: Merchant;
    }
) & { submit?: "contribution" | "admin" };

type OpenEditorDialogCallback = (
  options: Required<EditorDialogOptions>,
) => void;

interface EditorContextValue {
  openEditorDialog(options: EditorDialogOptions): void;
  onOpenEditorDialog: (callback: OpenEditorDialogCallback) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const callbacksRef = useRef<OpenEditorDialogCallback[]>([]);

  const openEditorDialog = useCallback((options: EditorDialogOptions) => {
    callbacksRef.current.forEach((callback) => {
      callback({
        ...options,
        submit: options.submit ?? "contribution",
      });
    });
  }, []);

  const onOpenEditorDialog = useCallback(
    (callback: OpenEditorDialogCallback) => {
      if (!callbacksRef.current.includes(callback)) {
        callbacksRef.current.push(callback);
      }
    },
    [],
  );

  const value: EditorContextValue = React.useMemo(
    () => ({
      openEditorDialog,
      onOpenEditorDialog,
    }),
    [openEditorDialog, onOpenEditorDialog],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
}
