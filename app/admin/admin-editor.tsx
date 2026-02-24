"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AliasInput,
  CountrySelector,
  SupportStatusSelect,
} from "@/components/dialog-shared";
import { SupportStatus } from "@/db/schema/support";
import { Merchant, MerchantCategory } from "@/db/schema/merchants";
import { merchantCategoryOptions, supportStatusOptions } from "@/lib/constants";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Landmark,
  Loader2,
  Pencil,
  Search,
  Smartphone,
  Store,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Bank } from "@/db/schema/banks";
import { updateBank } from "@/actions/bank-actions";
import { updateMerchant } from "@/actions/merchant-actions";

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
  const [weroSupport, setWeroSupport] = useState<SupportStatus>(
    bank.weroSupport,
  );
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

  function handleSave() {
    startTransition(async () => {
      try {
        await updateBank({
          id: bank.id,
          name,
          aliases,
          website,
          logoUrl,
          countries,
          weroSupport,
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
    <Card>
      <CardHeader>
        <CardTitle>Editing: {bank.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                  </a>
                </Button>
              </div>
            </div>
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
              label="Wero Support"
              value={weroSupport}
              onChange={setWeroSupport}
            />
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
              label="Standalone App"
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

          {bankingApps.length > 0 && (
            <>
              <Separator />
              <h4 className="font-semibold">Banking Apps</h4>
              <div className="space-y-3">
                {bankingApps.map((app) => (
                  <BankingAppEditor
                    key={app.id}
                    app={app}
                    onChange={(patch) => updateApp(app.id, patch)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
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
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Banking App Editor (inline)
// ============================================================================

function BankingAppEditor({
  app,
  onChange,
}: {
  app: Bank["bankingApps"][number];
  onChange: (patch: Partial<Bank["bankingApps"][number]>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone size={14} />
          {app.name}
        </CardTitle>
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
          <div className="flex items-center gap-2">
            <Switch
              checked={app.supportsDesktop}
              onCheckedChange={(v) => onChange({ supportsDesktop: v })}
            />
            <Label className="text-xs">Supports Desktop</Label>
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
    <Card>
      <CardHeader>
        <CardTitle>Editing: {merchant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                  </a>
                </Button>
              </div>
            </div>
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
      </CardContent>
      <CardFooter className="justify-end gap-2">
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
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// List Items
// ============================================================================

function BankListItem({ bank, onEdit }: { bank: Bank; onEdit: () => void }) {
  const statusOption = supportStatusOptions.find(
    (o) => o.value === bank.weroSupport,
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
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil size={14} />
        Edit
      </Button>
    </div>
  );
}

function MerchantListItem({
  merchant,
  onEdit,
}: {
  merchant: Merchant;
  onEdit: () => void;
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
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil size={14} />
        Edit
      </Button>
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
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [merchantSearch, setMerchantSearch] = useState("");

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
          <TabsList>
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
            {!editingBank && (
              <Card>
                <CardHeader>
                  <CardTitle>Banks</CardTitle>
                  <CardDescription>
                    Edit bank details, support statuses, and their banking apps.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={14}
                      />
                      <Input
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      <div className="space-y-2">
                        {filteredBanks.map((bank) => (
                          <BankListItem
                            key={bank.id}
                            bank={bank}
                            onEdit={() => setEditingBank(bank)}
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
            )}

            {editingBank && (
              <BankEditor
                key={editingBank.id}
                bank={editingBank}
                onDone={() => setEditingBank(null)}
              />
            )}
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants">
            {!editingMerchant && (
              <Card>
                <CardHeader>
                  <CardTitle>Merchants</CardTitle>
                  <CardDescription>
                    Edit merchant details and support statuses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={14}
                      />
                      <Input
                        placeholder="Search merchants..."
                        value={merchantSearch}
                        onChange={(e) => setMerchantSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      <div className="space-y-2">
                        {filteredMerchants.map((merchant) => (
                          <MerchantListItem
                            key={merchant.id}
                            merchant={merchant}
                            onEdit={() => setEditingMerchant(merchant)}
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
            )}

            {editingMerchant && (
              <MerchantEditor
                key={editingMerchant.id}
                merchant={editingMerchant}
                onDone={() => setEditingMerchant(null)}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
