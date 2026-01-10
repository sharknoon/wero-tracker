"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useContribution } from "@/lib/contribution-context";
import { BankBrandContribution } from "@/lib/contribution-types";
import { Bank, BankingApp, SupportStatus } from "@/lib/schema";
import { AlertTriangle, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  AliasInput,
  CountrySelector,
  SupportStatusSelect,
} from "./dialog-shared";

type BankFormData = Omit<Bank, "id"> & {
  id: string | undefined;
  markedForDeletion?: boolean;
};

type AppFormData = Omit<BankingApp, "id"> & {
  id: string | undefined;
  markedForDeletion?: boolean;
};

// ============================================================================
// Brand Information Section Component
// ============================================================================

interface BrandInformationSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  aliases: string[];
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (alias: string) => void;
  weroSupport: SupportStatus;
  onWeroSupportChange: (value: SupportStatus) => void;
  countries: string[];
  onToggleCountry: (country: string) => void;
  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

function BrandInformationSection({
  name,
  onNameChange,
  aliases,
  aliasInput,
  onAliasInputChange,
  onAddAlias,
  onRemoveAlias,
  weroSupport,
  onWeroSupportChange,
  countries,
  onToggleCountry,
  logoUrl,
  onLogoUrlChange,
  notes,
  onNotesChange,
}: BrandInformationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Brand Information
      </h3>

      <div className="space-y-2">
        <Label htmlFor="name">
          Bank Brand Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Deutsche Bank"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <AliasInput
        aliases={aliases}
        aliasInput={aliasInput}
        onAliasInputChange={onAliasInputChange}
        onAddAlias={onAddAlias}
        onRemoveAlias={onRemoveAlias}
      />

      <SupportStatusSelect
        label="Default Wero Support Status"
        value={weroSupport}
        onChange={onWeroSupportChange}
        required
      />

      <CountrySelector
        countries={countries}
        onToggleCountry={onToggleCountry}
      />

      <div className="space-y-2">
        <Label htmlFor="logoUrl">
          Logo URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(e) => onLogoUrlChange(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Provide a direct link to the bank&apos;s logo image
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Brand Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this bank brand..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Bank Item Component
// ============================================================================

interface BankItemProps {
  bank: BankFormData;
  index: number;
  isExpanded: boolean;
  isEdit: boolean;
  activeBanksCount: number;
  onToggleExpanded: () => void;
  onUpdate: (updates: Partial<BankFormData>) => void;
  onToggleDeletion: () => void;
  onRemove: () => void;
  canDelete: boolean;
  bankAliasInput: string;
  onBankAliasInputChange: (value: string) => void;
  onAddBankAlias: () => void;
  onRemoveBankAlias: (alias: string) => void;
}

function BankItem({
  bank,
  index,
  isExpanded,
  isEdit,
  activeBanksCount,
  onToggleExpanded,
  onUpdate,
  onToggleDeletion,
  onRemove,
  canDelete,
  bankAliasInput,
  onBankAliasInputChange,
  onAddBankAlias,
  onRemoveBankAlias,
}: BankItemProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggleExpanded}
      className={cn(
        "border rounded-lg overflow-hidden",
        bank.markedForDeletion && "border-destructive/50 bg-destructive/5",
      )}
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between w-full gap-2 me-2">
          <div className="text-start min-w-0">
            <div
              className={cn(
                "font-medium truncate",
                bank.markedForDeletion && "line-through text-muted-foreground",
              )}
            >
              {bank.name || `Bank ${index + 1}`}
            </div>
            {bank.website && (
              <div className="text-sm text-muted-foreground truncate">
                {bank.website}
              </div>
            )}
          </div>
          {bank.markedForDeletion && (
            <div className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded shrink-0">
              Will be deleted
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform text-muted-foreground",
            isExpanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="p-3 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., Deutsche Bank AG"
                value={bank.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                disabled={bank.markedForDeletion}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Website <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., https://www.deutsche-bank.de"
                value={bank.website}
                onChange={(e) => onUpdate({ website: e.target.value })}
                disabled={bank.markedForDeletion}
              />
            </div>
          </div>

          <AliasInput
            aliases={bank.aliases}
            aliasInput={bankAliasInput}
            onAliasInputChange={onBankAliasInputChange}
            onAddAlias={onAddBankAlias}
            onRemoveAlias={onRemoveBankAlias}
            disabled={bank.markedForDeletion}
          />

          <CountrySelector
            countries={bank.countries || []}
            onToggleCountry={(country) => {
              const currentCountries = bank.countries || [];
              if (currentCountries.includes(country)) {
                onUpdate({
                  countries: currentCountries.filter((c) => c !== country),
                });
              } else {
                onUpdate({ countries: [...currentCountries, country] });
              }
            }}
            disabled={bank.markedForDeletion}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={bank.logoUrl || ""}
                onChange={(e) => onUpdate({ logoUrl: e.target.value })}
                disabled={bank.markedForDeletion}
              />
            </div>
            <div className="space-y-2">
              <Label>BIC</Label>
              <Input
                placeholder="e.g., NTSBDEB1XXX"
                value={bank.bankContext || ""}
                onChange={(e) => onUpdate({ bankContext: e.target.value })}
                disabled={bank.markedForDeletion}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SupportStatusSelect
              label="P2P Payments Support"
              value={bank.P2PPaymentsSupport}
              onChange={(v) => onUpdate({ P2PPaymentsSupport: v })}
              disabled={bank.markedForDeletion}
            />
            <SupportStatusSelect
              label="Standalone App Support"
              value={bank.standaloneAppSupport}
              onChange={(v) => onUpdate({ standaloneAppSupport: v })}
              disabled={bank.markedForDeletion}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SupportStatusSelect
              label="E-Commerce Payments"
              value={bank.eCommercePaymentsSupport}
              onChange={(v) => onUpdate({ eCommercePaymentsSupport: v })}
              disabled={bank.markedForDeletion}
            />
            <SupportStatusSelect
              label="POS Payments"
              value={bank.POSPaymentsSupport}
              onChange={(v) => onUpdate({ POSPaymentsSupport: v })}
              disabled={bank.markedForDeletion}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {isEdit && bank.id && (
              <Button
                type="button"
                variant={bank.markedForDeletion ? "outline" : "destructive"}
                size="sm"
                onClick={onToggleDeletion}
                disabled={!canDelete}
                title={!canDelete ? "At least one bank must remain" : undefined}
              >
                <Trash2 className="size-4 mr-1" />
                {bank.markedForDeletion ? "Undo Delete" : "Mark for Deletion"}
              </Button>
            )}
            {!bank.id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={activeBanksCount <= 1}
              >
                <X className="size-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Banks Section Component
// ============================================================================

interface BanksSectionProps {
  banks: BankFormData[];
  expandedBanks: Set<number>;
  showBanksSection: boolean;
  isEdit: boolean;
  onAddBank: () => void;
  onUpdateBank: (index: number, updates: Partial<BankFormData>) => void;
  onToggleBankDeletion: (index: number) => void;
  onRemoveBank: (index: number) => void;
  onToggleBankExpanded: (index: number) => void;
  onShowBanksSection: () => void;
  canDeleteBank: (index: number) => boolean;
  bankAliasInputs: Record<number, string>;
  onBankAliasInputChange: (index: number, value: string) => void;
  onAddBankAlias: (index: number) => void;
  onRemoveBankAlias: (index: number, alias: string) => void;
}

function BanksSection({
  banks,
  expandedBanks,
  showBanksSection,
  isEdit,
  onAddBank,
  onUpdateBank,
  onToggleBankDeletion,
  onRemoveBank,
  onToggleBankExpanded,
  onShowBanksSection,
  canDeleteBank,
  bankAliasInputs,
  onBankAliasInputChange,
  onAddBankAlias,
  onRemoveBankAlias,
}: BanksSectionProps) {
  const activeBanksCount = banks.filter((b) => !b.markedForDeletion).length;

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Individual Banks <span className="text-destructive">*</span>
        </h3>
        {(showBanksSection || isEdit) && (
          <p className="text-xs text-muted-foreground">
            At least one bank required
          </p>
        )}
      </div>

      {!showBanksSection && !isEdit && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onShowBanksSection}
        >
          <Plus className="size-4 mr-1" />
          Add Bank (Required)
        </Button>
      )}

      {(showBanksSection || isEdit) && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Edit individual banks or mark them for deletion."
              : "Add individual bank entities (e.g., different branches or BICs)."}
          </p>

          {banks.map((bank, index) => (
            <BankItem
              key={bank.id || index}
              bank={bank}
              index={index}
              isExpanded={expandedBanks.has(index)}
              isEdit={isEdit}
              activeBanksCount={activeBanksCount}
              onToggleExpanded={() => onToggleBankExpanded(index)}
              onUpdate={(updates) => onUpdateBank(index, updates)}
              onToggleDeletion={() => onToggleBankDeletion(index)}
              onRemove={() => onRemoveBank(index)}
              canDelete={canDeleteBank(index)}
              bankAliasInput={bankAliasInputs[index] || ""}
              onBankAliasInputChange={(value) =>
                onBankAliasInputChange(index, value)
              }
              onAddBankAlias={() => onAddBankAlias(index)}
              onRemoveBankAlias={(alias) => onRemoveBankAlias(index, alias)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddBank}
          >
            <Plus className="size-4 mr-1" />
            Add Another Bank
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// App Item Component
// ============================================================================

interface AppItemProps {
  app: AppFormData;
  index: number;
  isExpanded: boolean;
  isEdit: boolean;
  onToggleExpanded: () => void;
  onUpdate: (updates: Partial<AppFormData>) => void;
  onToggleDeletion: () => void;
  onRemove: () => void;
}

function AppItem({
  app,
  index,
  isExpanded,
  isEdit,
  onToggleExpanded,
  onUpdate,
  onToggleDeletion,
  onRemove,
}: AppItemProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggleExpanded}
      className={cn(
        "border rounded-lg overflow-hidden",
        app.markedForDeletion && "border-destructive/50 bg-destructive/5",
      )}
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between w-full gap-2 me-2">
          <div className="text-start min-w-0">
            <div
              className={cn(
                "font-medium truncate",
                app.markedForDeletion && "line-through text-muted-foreground",
              )}
            >
              {app.name || `App ${index + 1}`}
            </div>
            {app.universalLink && (
              <div className="text-sm text-muted-foreground truncate">
                {app.universalLink}
              </div>
            )}
          </div>
          {app.markedForDeletion && (
            <div className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded shrink-0">
              Will be deleted
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform text-muted-foreground",
            isExpanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="p-3 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>
                App Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., Deutsche Bank Mobile"
                value={app.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                disabled={app.markedForDeletion}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Icon URL <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="https://example.com/icon.png"
                value={app.iconUrl || ""}
                onChange={(e) => onUpdate({ iconUrl: e.target.value })}
                disabled={app.markedForDeletion}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Universal Link <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://apps.apple.com/... or https://play.google.com/..."
              value={app.universalLink || ""}
              onChange={(e) => onUpdate({ universalLink: e.target.value })}
              disabled={app.markedForDeletion}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SupportStatusSelect
              label="Wero Support"
              value={app.weroSupport}
              onChange={(v) => onUpdate({ weroSupport: v })}
              disabled={app.markedForDeletion}
            />
            <div className="space-y-2">
              <Label>Supports Desktop</Label>
              <div className="flex items-center h-9">
                <Switch
                  checked={app.supportsDesktop}
                  onCheckedChange={(checked) =>
                    onUpdate({ supportsDesktop: checked })
                  }
                  disabled={app.markedForDeletion}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {app.supportsDesktop ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {isEdit && app.id && (
              <Button
                type="button"
                variant={app.markedForDeletion ? "outline" : "destructive"}
                size="sm"
                onClick={onToggleDeletion}
              >
                <Trash2 className="size-4 mr-1" />
                {app.markedForDeletion ? "Undo Delete" : "Mark for Deletion"}
              </Button>
            )}
            {!app.id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
              >
                <X className="size-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Apps Section Component
// ============================================================================

interface AppsSectionProps {
  apps: AppFormData[];
  expandedApps: Set<number>;
  showAppsSection: boolean;
  isEdit: boolean;
  onAddApp: () => void;
  onUpdateApp: (index: number, updates: Partial<AppFormData>) => void;
  onToggleAppDeletion: (index: number) => void;
  onRemoveApp: (index: number) => void;
  onToggleAppExpanded: (index: number) => void;
  onShowAppsSection: () => void;
}

function AppsSection({
  apps,
  expandedApps,
  showAppsSection,
  isEdit,
  onAddApp,
  onUpdateApp,
  onToggleAppDeletion,
  onRemoveApp,
  onToggleAppExpanded,
  onShowAppsSection,
}: AppsSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Banking Apps
        </h3>
        {!showAppsSection && !isEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowAppsSection}
          >
            <Plus className="size-4 mr-1" />
            Add Apps
          </Button>
        )}
      </div>

      {(showAppsSection || isEdit) && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Edit banking apps or mark them for deletion."
              : "Add banking apps associated with this brand."}
          </p>

          {apps.map((app, index) => (
            <AppItem
              key={app.id || index}
              app={app}
              index={index}
              isExpanded={expandedApps.has(index)}
              isEdit={isEdit}
              onToggleExpanded={() => onToggleAppExpanded(index)}
              onUpdate={(updates) => onUpdateApp(index, updates)}
              onToggleDeletion={() => onToggleAppDeletion(index)}
              onRemove={() => onRemoveApp(index)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddApp}
          >
            <Plus className="size-4 mr-1" />
            Add Another App
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Delete Mode Content Component
// ============================================================================

interface DeleteModeContentProps {
  existingBankBrandName: string;
  banks: BankFormData[];
  apps: AppFormData[];
  reason: string;
  onReasonChange: (value: string) => void;
  onToggleBankDeletion: (index: number) => void;
  onToggleAppDeletion: (index: number) => void;
  onToggleAllDeletion: (checked: boolean) => void;
  canDeleteBank: (index: number) => boolean;
}

function DeleteModeContent({
  existingBankBrandName,
  banks,
  apps,
  reason,
  onReasonChange,
  onToggleBankDeletion,
  onToggleAppDeletion,
  onToggleAllDeletion,
  canDeleteBank,
}: DeleteModeContentProps) {
  const banksMarkedForDeletion = banks.filter(
    (b) => b.markedForDeletion,
  ).length;
  const appsMarkedForDeletion = apps.filter((a) => a.markedForDeletion).length;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle className="font-bold">Deletion Request</AlertTitle>
        <AlertDescription>
          <p>
            You can request to remove the entire brand{" "}
            <span className="font-bold">{existingBankBrandName}</span> or select
            individual banks to remove.
          </p>
        </AlertDescription>
      </Alert>

      {/* Delete entire brand option */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">Delete entire brand</p>
          <p className="text-sm text-muted-foreground">
            Remove <span className="font-bold">{existingBankBrandName}</span>{" "}
            and all its banks and apps
          </p>
        </div>
        <Switch
          checked={
            banks.length > 0 &&
            banks.every((b) => b.markedForDeletion) &&
            apps.every((a) => a.markedForDeletion)
          }
          onCheckedChange={onToggleAllDeletion}
        />
      </div>

      {/* Individual banks deletion */}
      {banks.length > 0 && (
        <div className="space-y-2">
          <Label>Or select individual banks to remove:</Label>
          <div className="space-y-2">
            {banks.map((bank, index) => (
              <div
                key={bank.id || index}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  bank.markedForDeletion
                    ? "border-destructive/50 bg-destructive/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-start">
                    <div
                      className={`font-medium truncate ${bank.markedForDeletion ? "line-through text-muted-foreground" : ""}`}
                    >
                      {bank.name}
                    </div>
                    {bank.website && (
                      <div className="text-sm text-muted-foreground truncate">
                        ({new URL(bank.website).hostname})
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant={bank.markedForDeletion ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onToggleBankDeletion(index)}
                  disabled={!canDeleteBank(index)}
                  title={
                    !canDeleteBank(index)
                      ? "At least one bank must remain"
                      : undefined
                  }
                >
                  {bank.markedForDeletion ? "Undo" : "Mark for deletion"}
                </Button>
              </div>
            ))}
          </div>
          {banksMarkedForDeletion > 0 && (
            <p className="text-sm text-destructive">
              {banksMarkedForDeletion} bank(s) marked for deletion
            </p>
          )}
        </div>
      )}

      {/* Individual apps deletion */}
      {apps.length > 0 && (
        <div className="space-y-2">
          <Label>Or select individual apps to remove:</Label>
          <div className="space-y-2">
            {apps.map((app, index) => (
              <div
                key={app.id || index}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  app.markedForDeletion
                    ? "border-destructive/50 bg-destructive/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${app.markedForDeletion ? "line-through text-muted-foreground" : ""}`}
                  >
                    {app.name}
                  </span>
                </div>
                <Button
                  variant={app.markedForDeletion ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onToggleAppDeletion(index)}
                >
                  {app.markedForDeletion ? "Undo" : "Mark for deletion"}
                </Button>
              </div>
            ))}
          </div>
          {appsMarkedForDeletion > 0 && (
            <p className="text-sm text-destructive">
              {appsMarkedForDeletion} app(s) marked for deletion
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">
          Reason for deletion <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reason"
          placeholder="Why should this bank/these banks be removed?"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Dialog Component
// ============================================================================

export function BankBrandDialog() {
  const {
    isDialogOpen,
    dialogType,
    dialogAction,
    existingBankBrand,
    closeDialog,
    submitContribution,
  } = useContribution();

  const isOpen = isDialogOpen && dialogType === "bank-brand";
  const isEdit = dialogAction === "edit";
  const isDelete = dialogAction === "delete";

  // Brand form state
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [weroSupport, setWeroSupport] = useState<SupportStatus>("unknown");
  const [countries, setCountries] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  // Banks form state
  const [banks, setBanks] = useState<BankFormData[]>([]);
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  const [bankAliasInputs, setBankAliasInputs] = useState<
    Record<number, string>
  >({});

  // Apps form state
  const [apps, setApps] = useState<AppFormData[]>([]);
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());

  // For add mode - whether to add banks/apps
  const [showBanksSection, setShowBanksSection] = useState(false);
  const [showAppsSection, setShowAppsSection] = useState(false);

  const resetForm = () => {
    setName("");
    setAliases([]);
    setAliasInput("");
    setWeroSupport("unknown");
    setCountries([]);
    setLogoUrl("");
    setNotes("");
    setReason("");
    setBanks([]);
    setExpandedBanks(new Set());
    setBankAliasInputs({});
    setShowBanksSection(false);
    setApps([]);
    setExpandedApps(new Set());
    setShowAppsSection(false);
  };

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (isOpen && existingBankBrand && (isEdit || isDelete)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form initialization in dialog is a valid pattern
      setName(existingBankBrand.name);
      setAliases(existingBankBrand.aliases);
      setWeroSupport(existingBankBrand.weroSupport);
      setCountries(existingBankBrand.countries);
      setLogoUrl(existingBankBrand.logoUrl);
      setNotes(existingBankBrand.notes || "");
      // Populate banks
      const bankData = existingBankBrand.banks.map((bank) => ({
        ...bank,
        markedForDeletion: false,
      }));
      setBanks(bankData);
      setShowBanksSection(bankData.length > 0);
      // Populate apps
      const appData = existingBankBrand.apps.map((app) => ({
        ...app,
        markedForDeletion: false,
      }));
      setApps(appData);
      setShowAppsSection(appData.length > 0);
    } else if (isOpen && !isEdit && !isDelete) {
      resetForm();
    }
  }, [isOpen, existingBankBrand, isEdit, isDelete]);

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()]);
      setAliasInput("");
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter((a) => a !== alias));
  };

  const handleToggleCountry = (country: string) => {
    if (countries.includes(country)) {
      setCountries(countries.filter((c) => c !== country));
    } else {
      setCountries([...countries, country]);
    }
  };

  // Bank management functions
  const handleAddBank = () => {
    const newIndex = banks.length;
    setBanks([
      ...banks,
      {
        id: undefined,
        name: "",
        website: "",
        bankContext: "",
        appIds: [],
        aliases: [],
        countries: [],
        logoUrl: "",
        standaloneAppSupport: "unknown",
        P2PPaymentsSupport: "unknown",
        eCommercePaymentsSupport: "unknown",
        POSPaymentsSupport: "unknown",
      },
    ]);
    setExpandedBanks((prev) => new Set([...prev, newIndex]));
  };

  const handleUpdateBank = (index: number, updates: Partial<BankFormData>) => {
    setBanks((prev) =>
      prev.map((bank, i) => (i === index ? { ...bank, ...updates } : bank)),
    );
  };

  const handleToggleBankDeletion = (index: number) => {
    if (!canDeleteBank(index)) return;
    setBanks((prev) =>
      prev.map((bank, i) =>
        i === index
          ? { ...bank, markedForDeletion: !bank.markedForDeletion }
          : bank,
      ),
    );
  };

  const handleRemoveBank = (index: number) => {
    setBanks((prev) => prev.filter((_, i) => i !== index));
    setExpandedBanks((prev) => {
      const newSet = new Set<number>();
      prev.forEach((i) => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const toggleBankExpanded = (index: number) => {
    setExpandedBanks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Bank alias management functions
  const handleBankAliasInputChange = (index: number, value: string) => {
    setBankAliasInputs((prev) => ({ ...prev, [index]: value }));
  };

  const handleAddBankAlias = (index: number) => {
    const input = bankAliasInputs[index]?.trim();
    if (input && !banks[index].aliases.includes(input)) {
      setBanks((prev) =>
        prev.map((bank, i) =>
          i === index ? { ...bank, aliases: [...bank.aliases, input] } : bank,
        ),
      );
      setBankAliasInputs((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const handleRemoveBankAlias = (index: number, alias: string) => {
    setBanks((prev) =>
      prev.map((bank, i) =>
        i === index
          ? { ...bank, aliases: bank.aliases.filter((a) => a !== alias) }
          : bank,
      ),
    );
  };

  // App management functions
  const handleAddApp = () => {
    const newIndex = apps.length;
    setApps([
      ...apps,
      {
        id: undefined,
        name: "",
        iconUrl: "",
        universalLink: "",
        supportsDesktop: false,
        weroSupport: "unknown",
      },
    ]);
    setExpandedApps((prev) => new Set([...prev, newIndex]));
  };

  const handleUpdateApp = (index: number, updates: Partial<AppFormData>) => {
    setApps((prev) =>
      prev.map((app, i) => (i === index ? { ...app, ...updates } : app)),
    );
  };

  const handleToggleAppDeletion = (index: number) => {
    setApps((prev) =>
      prev.map((app, i) =>
        i === index
          ? { ...app, markedForDeletion: !app.markedForDeletion }
          : app,
      ),
    );
  };

  const handleRemoveApp = (index: number) => {
    setApps((prev) => prev.filter((_, i) => i !== index));
    setExpandedApps((prev) => {
      const newSet = new Set<number>();
      prev.forEach((i) => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const toggleAppExpanded = (index: number) => {
    setExpandedApps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    const contribution: BankBrandContribution = {
      id: crypto.randomUUID(),
      type: "bank-brand",
      action: dialogAction!,
      reason: reason,
      data: {
        id: existingBankBrand?.id,
        name,
        aliases,
        weroSupport,
        countries,
        logoUrl,
        banks,
        apps,
        notes,
      },
    };

    submitContribution(contribution);
  };

  const handleClose = () => {
    resetForm();
    closeDialog();
  };

  const getTitle = () => {
    if (isDelete) return "Suggest Deletion";
    if (isEdit) return "Suggest Edit";
    return "Add New Bank";
  };

  const getDescription = () => {
    if (isDelete)
      return `Request to remove "${existingBankBrand?.name}" or individual banks / apps from the tracker.`;
    if (isEdit)
      return `Suggest changes to "${existingBankBrand?.name}" and its banks / apps.`;
    return "Submit a new bank to be added to the tracker. Your submission will be reviewed before being published.";
  };

  const activeBanksCount = banks.filter((b) => !b.markedForDeletion).length;

  const canDeleteBank = (index: number) => {
    const bank = banks[index];
    if (bank.markedForDeletion) return true; // Can always undo
    return activeBanksCount > 1; // Must keep at least one bank
  };

  const getSubmitValidation = () => {
    if (isDelete) {
      const banksMarkedForDeletion = banks.filter(
        (b) => b.markedForDeletion,
      ).length;
      const appsMarkedForDeletion = apps.filter(
        (a) => a.markedForDeletion,
      ).length;
      const hasItemsToDelete =
        banksMarkedForDeletion > 0 || appsMarkedForDeletion > 0;
      const hasReason = reason.trim().length > 0;

      if (!hasReason)
        return {
          valid: false,
          message: "Please provide a reason for deletion",
        };
      if (!hasItemsToDelete)
        return { valid: false, message: "Select at least one item to delete" };

      return { valid: true, message: "" };
    }

    const errors: string[] = [];
    if (!name.trim()) errors.push("Brand name");
    if (!logoUrl.trim()) errors.push("Logo URL");
    if (countries.length === 0) errors.push("At least one country");
    if (activeBanksCount === 0) errors.push("At least one bank");
    if (isEdit && !reason.trim()) errors.push("Reason for changes");

    // Validate individual banks
    const activeBanks = banks.filter((b) => !b.markedForDeletion);
    const invalidBanks = activeBanks.filter(
      (b) => !b.name.trim() || !b.website.trim(),
    );
    if (invalidBanks.length > 0) {
      errors.push(`${invalidBanks.length} bank(s) missing required fields`);
    }

    // Validate individual apps
    const activeApps = apps.filter((a) => !a.markedForDeletion);
    const invalidApps = activeApps.filter(
      (a) => !a.name.trim() || !a.iconUrl?.trim() || !a.universalLink?.trim(),
    );
    if (invalidApps.length > 0) {
      errors.push(`${invalidApps.length} app(s) missing required fields`);
    }

    if (errors.length > 0) {
      return { valid: false, message: `Missing: ${errors.join(", ")}` };
    }

    return { valid: true, message: "" };
  };

  const handleToggleAllDeletion = (checked: boolean) => {
    setBanks((prev) => prev.map((b) => ({ ...b, markedForDeletion: checked })));
    setApps((prev) => prev.map((a) => ({ ...a, markedForDeletion: checked })));
  };

  const handleShowBanksSection = () => {
    setShowBanksSection(true);
    handleAddBank();
  };

  const handleShowAppsSection = () => {
    setShowAppsSection(true);
    handleAddApp();
  };

  const validation = getSubmitValidation();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4 -mr-4 **:max-w-[calc(100vw-5rem)] sm:**:max-w-116">
          <div className="space-y-4 py-2">
            {isDelete ? (
              <DeleteModeContent
                existingBankBrandName={existingBankBrand?.name || ""}
                banks={banks}
                apps={apps}
                reason={reason}
                onReasonChange={setReason}
                onToggleBankDeletion={handleToggleBankDeletion}
                onToggleAppDeletion={handleToggleAppDeletion}
                onToggleAllDeletion={handleToggleAllDeletion}
                canDeleteBank={canDeleteBank}
              />
            ) : (
              <>
                <BrandInformationSection
                  name={name}
                  onNameChange={setName}
                  aliases={aliases}
                  aliasInput={aliasInput}
                  onAliasInputChange={setAliasInput}
                  onAddAlias={handleAddAlias}
                  onRemoveAlias={handleRemoveAlias}
                  weroSupport={weroSupport}
                  onWeroSupportChange={setWeroSupport}
                  countries={countries}
                  onToggleCountry={handleToggleCountry}
                  logoUrl={logoUrl}
                  onLogoUrlChange={setLogoUrl}
                  notes={notes}
                  onNotesChange={setNotes}
                />

                <BanksSection
                  banks={banks}
                  expandedBanks={expandedBanks}
                  showBanksSection={showBanksSection}
                  isEdit={isEdit}
                  onAddBank={handleAddBank}
                  onUpdateBank={handleUpdateBank}
                  onToggleBankDeletion={handleToggleBankDeletion}
                  onRemoveBank={handleRemoveBank}
                  onToggleBankExpanded={toggleBankExpanded}
                  onShowBanksSection={handleShowBanksSection}
                  canDeleteBank={canDeleteBank}
                  bankAliasInputs={bankAliasInputs}
                  onBankAliasInputChange={handleBankAliasInputChange}
                  onAddBankAlias={handleAddBankAlias}
                  onRemoveBankAlias={handleRemoveBankAlias}
                />

                <AppsSection
                  apps={apps}
                  expandedApps={expandedApps}
                  showAppsSection={showAppsSection}
                  isEdit={isEdit}
                  onAddApp={handleAddApp}
                  onUpdateApp={handleUpdateApp}
                  onToggleAppDeletion={handleToggleAppDeletion}
                  onRemoveApp={handleRemoveApp}
                  onToggleAppExpanded={toggleAppExpanded}
                  onShowAppsSection={handleShowAppsSection}
                />

                {isEdit && (
                  <>
                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        Reason for changes{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Why are you suggesting these changes?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center">
          {!validation.valid && validation.message && (
            <p className="text-xs text-muted-foreground mr-auto">
              {validation.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validation.valid}
              variant={isDelete ? "destructive" : "default"}
            >
              {isDelete ? "Submit Deletion Request" : "Submit for Review"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
