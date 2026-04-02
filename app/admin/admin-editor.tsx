"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AliasInput,
  CountrySelector,
  SupportStatusSelect,
  WebsiteInput,
} from "@/components/dialog-shared";
import { SupportStatus } from "@/db/schema/support";
import { Merchant, MerchantCategory } from "@/db/schema/merchants";
import { merchantCategoryOptions, supportStatusOptions } from "@/lib/constants";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Search,
  Smartphone,
  Store,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Bank } from "@/db/schema/banks";
import { createBank, updateBank, deleteBank } from "@/actions/bank-actions";
import {
  createMerchant,
  updateMerchant,
  deleteMerchant,
} from "@/actions/merchant-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateWeroSupport } from "@/lib/bank-helper";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// ============================================================================
// Bank Editor
// ============================================================================

function BankEditor({ bank, onDone }: { bank: Bank; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [name, setName] = useState(bank.name);
  const [aliases, setAliases] = useState<string[]>(bank.aliases);
  const [aliasInput, setAliasInput] = useState("");
  const [website, setWebsite] = useState(bank.website);
  const [logoUrl, setLogoUrl] = useState(bank.logoUrl);
  const [countries, setCountries] = useState<string[]>(bank.countries);
  const [p2pPaymentsSupport, setP2pPaymentsSupport] = useState<SupportStatus>(
    bank.p2pPaymentsSupport,
  );
  const [eCommercePaymentsSupport, setECommercePaymentsSupport] =
    useState<SupportStatus>(bank.eCommercePaymentsSupport);
  const [posPaymentsSupport, setPosPaymentsSupport] = useState<SupportStatus>(
    bank.posPaymentsSupport,
  );
  const [standaloneAppSupport, setStandaloneAppSupport] =
    useState<SupportStatus>(bank.standaloneAppSupport);
  const [notes, setNotes] = useState(bank.notes ?? "");
  const [bankingApps, setBankingApps] = useState<Bank["bankingApps"]>(
    bank.bankingApps,
  );

  function handleAddAlias() {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases([...aliases, trimmed]);
      setAliasInput("");
    }
  }

  function updateApp(
    appId: string,
    patch: Partial<Bank["bankingApps"][number]>,
  ) {
    setBankingApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...patch } : a)),
    );
  }

  function addApp() {
    setBankingApps((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        iconUrl: "",
        iconChecksum: "",
        universalLink: "",
        weroSupport: "not-supported" as SupportStatus,
      },
    ]);
  }

  function removeApp(appId: string) {
    setBankingApps((prev) => prev.filter((a) => a.id !== appId));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateBank({
          id: bank.id,
          name,
          aliases,
          website,
          logoUrl,
          logoChecksum: bank.logoChecksum,
          countries,
          p2pPaymentsSupport,
          eCommercePaymentsSupport,
          posPaymentsSupport,
          standaloneAppSupport,
          bankingApps,
          notes: notes || null,
        });
        router.refresh();
        onDone();
      } catch (error) {
        alert(error instanceof Error ? error.message : error);
      }
    });
  }

  return (
    <DialogContent
      className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      aria-describedby={undefined}
    >
      <DialogHeader>
        <DialogTitle>Editing: {bank.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <WebsiteInput value={website} onChange={setWebsite} />
          <div className="space-y-2 md:col-span-2">
            <Label>Logo URL</Label>
            <div className="flex items-center gap-3">
              {logoUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="size-10 shrink-0 rounded-md object-contain bg-white p-0.5 border"
                />
              )}
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AliasInput
          aliases={aliases}
          aliasInput={aliasInput}
          onAliasInputChange={setAliasInput}
          onAddAlias={handleAddAlias}
          onRemoveAlias={(a) => setAliases(aliases.filter((x) => x !== a))}
        />

        <CountrySelector
          countries={countries}
          onToggleCountry={(c) =>
            setCountries(
              countries.includes(c)
                ? countries.filter((x) => x !== c)
                : [...countries, c],
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SupportStatusSelect
            label="P2P Payments"
            value={p2pPaymentsSupport}
            onChange={setP2pPaymentsSupport}
          />
          <SupportStatusSelect
            label="E-Commerce Payments"
            value={eCommercePaymentsSupport}
            onChange={setECommercePaymentsSupport}
          />
          <SupportStatusSelect
            label="POS Payments"
            value={posPaymentsSupport}
            onChange={setPosPaymentsSupport}
          />
          <SupportStatusSelect
            label="Standalone Wero App"
            value={standaloneAppSupport}
            onChange={setStandaloneAppSupport}
          />
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>

        <Separator />
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Banking Apps</h4>
          <Button variant="outline" size="sm" onClick={addApp}>
            <Plus size={14} />
            Add App
          </Button>
        </div>
        {bankingApps.length > 0 && (
          <div className="space-y-3">
            {bankingApps.map((app) => (
              <BankingAppEditor
                key={app.id}
                app={app}
                onChange={(patch) => updateApp(app.id, patch)}
                onRemove={() => removeApp(app.id)}
              />
            ))}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Check size={14} />
          )}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================================================
// Banking App Editor (inline)
// ============================================================================

function BankingAppEditor({
  app,
  onChange,
  onRemove,
}: {
  app: Bank["bankingApps"][number];
  onChange: (patch: Partial<Bank["bankingApps"][number]>) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone size={14} />
            {app.name || "New App"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 size={14} />
            Remove
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input
              value={app.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Icon URL</Label>
            <div className="flex items-center gap-2">
              {app.iconUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={app.iconUrl}
                  alt="Icon preview"
                  className="size-8 shrink-0 rounded-md object-contain bg-white"
                />
              )}
              <Input
                value={app.iconUrl}
                onChange={(e) => onChange({ iconUrl: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Universal Link</Label>
            <div className="flex items-center gap-2">
              <Input
                value={app.universalLink}
                onChange={(e) => onChange({ universalLink: e.target.value })}
                className="h-8 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 size-8"
                asChild
              >
                <a
                  href={app.universalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                </a>
              </Button>
            </div>
          </div>
          <SupportStatusSelect
            label="Wero Support"
            value={app.weroSupport}
            onChange={(v) => onChange({ weroSupport: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Merchant Editor
// ============================================================================

function MerchantEditor({
  merchant,
  onDone,
}: {
  merchant: Merchant;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [name, setName] = useState(merchant.name);
  const [aliases, setAliases] = useState<string[]>(merchant.aliases);
  const [aliasInput, setAliasInput] = useState("");
  const [website, setWebsite] = useState(merchant.website);
  const [logoUrl, setLogoUrl] = useState(merchant.logoUrl);
  const [category, setCategory] = useState<MerchantCategory>(merchant.category);
  const [weroSupport, setWeroSupport] = useState<SupportStatus>(
    merchant.weroSupport,
  );
  const [notes, setNotes] = useState(merchant.notes ?? "");

  function handleAddAlias() {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases([...aliases, trimmed]);
      setAliasInput("");
    }
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateMerchant({
          id: merchant.id,
          name,
          aliases,
          website,
          logoUrl,
          logoChecksum: merchant.logoChecksum,
          category,
          weroSupport,
          notes: notes || null,
        });
        router.refresh();
        onDone();
      } catch (error) {
        alert(error instanceof Error ? error.message : error);
      }
    });
  }

  return (
    <DialogContent
      className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      aria-describedby={undefined}
    >
      <DialogHeader>
        <DialogTitle>Editing: {merchant.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <WebsiteInput value={website} onChange={setWebsite} />
          <div className="space-y-2 md:col-span-2">
            <Label>Logo URL</Label>
            <div className="flex items-center gap-3">
              {logoUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="size-10 shrink-0 rounded-md object-contain bg-white p-0.5 border"
                />
              )}
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AliasInput
          aliases={aliases}
          aliasInput={aliasInput}
          onAliasInputChange={setAliasInput}
          onAddAlias={handleAddAlias}
          onRemoveAlias={(a) => setAliases(aliases.filter((x) => x !== a))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as MerchantCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {merchantCategoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SupportStatusSelect
            label="Wero Support"
            value={weroSupport}
            onChange={setWeroSupport}
          />
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Check size={14} />
          )}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================================================
// List Items
// ============================================================================

function BankListItem({
  bank,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  bank: Bank;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const weroSupport = calculateWeroSupport(bank);
  const statusOption = supportStatusOptions.find(
    (o) => o.value === weroSupport,
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bank.logoUrl}
          alt={bank.name}
          className="size-8 rounded-md object-contain bg-white p-0.5"
        />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{bank.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {statusOption && (
              <span className="flex items-center gap-1">
                <statusOption.icon
                  className={statusOption.iconColor}
                  size={12}
                />
                {statusOption.label}
              </span>
            )}
            <span>
              {bank.bankingApps.length} app
              {bank.bankingApps.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy size={14} />
          Duplicate
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {bank.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                bank and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function MerchantListItem({
  merchant,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  merchant: Merchant;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const statusOption = supportStatusOptions.find(
    (o) => o.value === merchant.weroSupport,
  );
  const categoryOption = merchantCategoryOptions.find(
    (o) => o.value === merchant.category,
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={merchant.logoUrl}
          alt={merchant.name}
          className="size-8 rounded-md object-contain bg-white p-0.5"
        />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{merchant.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {statusOption && (
              <span className="flex items-center gap-1">
                <statusOption.icon
                  className={statusOption.iconColor}
                  size={12}
                />
                {statusOption.label}
              </span>
            )}
            {categoryOption && (
              <span>
                {categoryOption.emoji} {categoryOption.label}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy size={14} />
          Duplicate
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {merchant.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                merchant and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ============================================================================
// Main Admin Editor
// ============================================================================

interface AdminEditorProps {
  banks: Bank[];
  merchants: Merchant[];
}

export function AdminEditor({ banks, merchants }: AdminEditorProps) {
  const router = useRouter();
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [merchantSearch, setMerchantSearch] = useState("");

  async function handleDeleteBank(id: string) {
    try {
      await deleteBank(id);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : error);
    }
  }

  async function handleDeleteMerchant(id: string) {
    try {
      await deleteMerchant(id);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : error);
    }
  }

  async function handleDuplicateBank(bank: Bank) {
    try {
      const copy = await createBank({
        name: `${bank.name} (Copy)`,
        aliases: bank.aliases,
        website: bank.website,
        logoUrl: bank.logoUrl,
        logoChecksum: bank.logoChecksum,
        countries: bank.countries,
        p2pPaymentsSupport: bank.p2pPaymentsSupport,
        eCommercePaymentsSupport: bank.eCommercePaymentsSupport,
        posPaymentsSupport: bank.posPaymentsSupport,
        standaloneAppSupport: bank.standaloneAppSupport,
        bankingApps: bank.bankingApps.map((app) => ({
          ...app,
          id: crypto.randomUUID(),
        })),
        notes: bank.notes,
      });
      router.refresh();
      setEditingBank(copy);
    } catch (error) {
      alert(error instanceof Error ? error.message : error);
    }
  }

  async function handleDuplicateMerchant(merchant: Merchant) {
    try {
      const copy = await createMerchant({
        name: `${merchant.name} (Copy)`,
        aliases: merchant.aliases,
        website: merchant.website,
        logoUrl: merchant.logoUrl,
        logoChecksum: merchant.logoChecksum,
        category: merchant.category,
        weroSupport: merchant.weroSupport,
        notes: merchant.notes,
      });
      router.refresh();
      setEditingMerchant(copy);
    } catch (error) {
      alert(error instanceof Error ? error.message : error);
    }
  }

  const filteredBanks = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.aliases.some((a) => a.toLowerCase().includes(bankSearch.toLowerCase())),
  );

  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
      m.aliases.some((a) =>
        a.toLowerCase().includes(merchantSearch.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft size={16} />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Admin Editor</h1>
              <p className="text-xs text-muted-foreground">
                Edit banks, merchants and banking apps directly.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs defaultValue="banks">
          <TabsList className="mb-2.5">
            <TabsTrigger value="banks">
              <Landmark size={14} />
              Banks ({banks.length})
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Store size={14} />
              Merchants ({merchants.length})
            </TabsTrigger>
          </TabsList>

          {/* Banks Tab */}
          <TabsContent value="banks">
            <Card>
              <CardHeader>
                <CardTitle>Banks</CardTitle>
                <CardDescription>
                  Edit bank details, support statuses, and their banking apps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Search banks..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      spellCheck={false}
                    />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    {bankSearch && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Clear"
                          title="Clear"
                          size="icon-xs"
                          onClick={() => setBankSearch("")}
                        >
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-2">
                      {filteredBanks.map((bank) => (
                        <BankListItem
                          key={bank.id}
                          bank={bank}
                          onEdit={() => setEditingBank(bank)}
                          onDuplicate={() => handleDuplicateBank(bank)}
                          onDelete={() => handleDeleteBank(bank.id)}
                        />
                      ))}
                      {filteredBanks.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No banks found.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Dialog
              open={!!editingBank}
              onOpenChange={(open) => {
                if (!open) setEditingBank(null);
              }}
            >
              {editingBank && (
                <BankEditor
                  key={editingBank.id}
                  bank={editingBank}
                  onDone={() => setEditingBank(null)}
                />
              )}
            </Dialog>
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants">
            <Card>
              <CardHeader>
                <CardTitle>Merchants</CardTitle>
                <CardDescription>
                  Edit merchant details and support statuses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Search online shops..."
                      value={merchantSearch}
                      onChange={(e) => setMerchantSearch(e.target.value)}
                      spellCheck={false}
                    />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    {merchantSearch && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Clear"
                          title="Clear"
                          size="icon-xs"
                          onClick={() => setMerchantSearch("")}
                        >
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-2">
                      {filteredMerchants.map((merchant) => (
                        <MerchantListItem
                          key={merchant.id}
                          merchant={merchant}
                          onEdit={() => setEditingMerchant(merchant)}
                          onDuplicate={() => handleDuplicateMerchant(merchant)}
                          onDelete={() => handleDeleteMerchant(merchant.id)}
                        />
                      ))}
                      {filteredMerchants.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No merchants found.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Dialog
              open={!!editingMerchant}
              onOpenChange={(open) => {
                if (!open) setEditingMerchant(null);
              }}
            >
              {editingMerchant && (
                <MerchantEditor
                  key={editingMerchant.id}
                  merchant={editingMerchant}
                  onDone={() => setEditingMerchant(null)}
                />
              )}
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
