"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Filter,
  Landmark,
  Loader2,
  MessageSquare,
  Plus,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { diffLines } from "diff";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type {
  BankContributionData,
  ContributionAction,
  ContributionStatus,
  ContributionType,
  MerchantContributionData,
} from "@/db/schema/contributions";
import {
  ContributionWithRelations,
  getContributions,
  getContributionCounts,
  rejectOrApproveContribution,
} from "@/actions/contribution-actions";
import stableStringify from "json-stable-stringify";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { findDuplicateBanks } from "@/actions/bank-actions";
import { findDuplicateMerchants } from "@/actions/merchant-actions";
import { CONTRIBUTIONS_PAGE_SIZE } from "@/lib/constants";
import { triggerWeroImport } from "@/actions/import-actions";
import type { WeroImportResult } from "@/lib/wero-import";

// ============================================================================
// Types
// ============================================================================

type ContributionCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

interface ContributionsPageProps {
  initialContributions?: ContributionWithRelations[];
  initialTotalCount?: number;
  initialCounts?: ContributionCounts;
  currentUser?: { id: string; role: string } | null;
  loading?: boolean;
}

// ============================================================================
// Status & Action Config
// ============================================================================

const statusConfig: Record<
  ContributionStatus,
  { label: string; icon: React.ElementType; badgeClassName: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
  approved: {
    label: "Approved",
    icon: Check,
    badgeClassName: "bg-green-500/10 text-green-500 border-green-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: X,
    badgeClassName: "bg-red-500/10 text-red-500 border-red-500/30",
  },
} as const;

const actionConfig: Record<
  ContributionAction,
  { label: string; icon: React.ElementType; badgeClassName: string }
> = {
  add: {
    label: "Addition",
    icon: Plus,
    badgeClassName: "bg-green-500/10 text-green-500",
  },
  edit: {
    label: "Edit",
    icon: Edit3,
    badgeClassName: "bg-blue-500/10 text-blue-500",
  },
  delete: {
    label: "Deletion",
    icon: Trash2,
    badgeClassName: "bg-red-500/10 text-red-500",
  },
};

const typeConfig: Record<
  ContributionType,
  { label: string; icon: React.ElementType }
> = {
  bank: {
    label: "Bank",
    icon: Landmark,
  },
  merchant: {
    label: "Merchant",
    icon: Store,
  },
} as const;

// ============================================================================
// Status Badge
// ============================================================================

function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        config.badgeClassName,
      )}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// ============================================================================
// Action Badge
// ============================================================================

function ActionBadge({ action }: { action: ContributionAction }) {
  const config = actionConfig[action];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        config.badgeClassName,
      )}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// ============================================================================
// Type Badge
// ============================================================================

function TypeBadge({ type }: { type: ContributionType }) {
  const config = typeConfig[type];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// ============================================================================
// Data Preview
// ============================================================================

function DiffViewer({
  oldJson = "",
  newJson = "",
}: {
  oldJson?: string;
  newJson?: string;
}) {
  const changes = diffLines(oldJson, newJson);
  let oldLine = 1;
  let newLine = 1;

  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden text-xs font-mono min-w-0 max-w-full">
      <div className="flex items-center gap-3 px-3 py-1.5 border-b bg-muted/50 text-muted-foreground text-[11px]">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-red-400" />
          Removed
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-green-400" />
          Added
        </span>
      </div>
      <pre className="overflow-x-auto min-w-0 max-w-full">
        {changes.map((change, i) => {
          const lines = change.value.replace(/\n$/, "").split("\n");
          return lines.map((line, j) => {
            let lineNum: string;
            if (change.added) {
              lineNum = String(newLine++).padStart(3, " ");
            } else if (change.removed) {
              lineNum = String(oldLine++).padStart(3, " ");
            } else {
              oldLine++;
              lineNum = String(newLine++).padStart(3, " ");
            }

            return (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "flex",
                  change.added &&
                    "bg-green-500/10 text-green-700 dark:text-green-400",
                  change.removed &&
                    "bg-red-500/10 text-red-700 dark:text-red-400",
                )}
              >
                <span className="select-none w-10 shrink-0 text-right pr-2 text-muted-foreground/50 border-r border-border/50">
                  {lineNum}
                </span>
                <span className="px-1 whitespace-pre-wrap break-all min-w-0">
                  {line}
                </span>
              </div>
            );
          });
        })}
      </pre>
    </div>
  );
}

function DataPreview({
  contribution,
}: {
  contribution: ContributionWithRelations;
}) {
  const data = contribution.data;
  const previousData = contribution.previousData;

  const newJson = stableStringify(data, { space: "  " }) ?? "";
  const oldJson = previousData
    ? (stableStringify(previousData, { space: "  " }) ?? "")
    : undefined;

  if (contribution.action === "delete") {
    return <DiffViewer oldJson={newJson} />;
  }

  return <DiffViewer oldJson={oldJson} newJson={newJson} />;
}

// ============================================================================
// Duplicate Warning
// ============================================================================

async function findContributionDuplicates(
  contribution: ContributionWithRelations,
): Promise<{ id: string; name: string; logoUrl: string; website: string }[]> {
  if (contribution.action !== "add") return [];
  if (contribution.type === "bank") {
    const data = contribution.data as BankContributionData;
    const duplicates = await findDuplicateBanks({ website: data.website });
    return duplicates.map((b) => ({
      id: b.id,
      name: b.name.default,
      logoUrl: b.logoUrl,
      website: b.website.default,
    }));
  } else {
    const data = contribution.data as MerchantContributionData;
    const duplicates = await findDuplicateMerchants({ website: data.website });
    return duplicates.map((m) => ({
      id: m.id,
      name: m.name,
      logoUrl: m.logoUrl,
      website: m.website,
    }));
  }
}

function DuplicateWarning({
  contribution,
}: {
  contribution: ContributionWithRelations;
  compact?: boolean;
}) {
  const [duplicates, setDuplicates] = useState<
    { id: string; name: string; logoUrl: string; website: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    findContributionDuplicates(contribution).then((result) => {
      if (!cancelled) {
        setDuplicates(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [contribution]);

  if (contribution.action !== "add") return null;

  if (loading) {
    return (
      <Alert>
        <Loader2 className="animate-spin" />
        <AlertTitle>Checking for duplicates…</AlertTitle>
      </Alert>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Alert className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle2 />
        <AlertTitle>No duplicates found</AlertTitle>
      </Alert>
    );
  }
  return (
    <Alert className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
      <AlertTriangle />
      <AlertTitle className="font-bold">Possible duplicate</AlertTitle>
      <AlertDescription className="text-yellow-700/90 dark:text-yellow-400/90">
        <p className="mb-1!">
          {duplicates.length === 1
            ? "An entry with the same domain already exists:"
            : `${duplicates.length} entries with the same domain already exist:`}
        </p>
        <ItemGroup>
          {duplicates.map((d) => (
            <Item key={d.id} variant="outline" size="sm">
              <ItemMedia variant="image" className="mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.logoUrl}
                  alt=""
                  className="bg-white p-1 object-contain!"
                />
              </ItemMedia>
              <ItemContent className="flex-row items-end gap-2!">
                <ItemTitle>{d.name}</ItemTitle>
                <ItemDescription>{d.website}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// Logo Preview
// ============================================================================

function LogoPreview({
  contribution,
}: {
  contribution: ContributionWithRelations;
}) {
  const data = contribution.data as Record<string, unknown> | null;
  const logoUrl = data?.logoUrl as string | undefined;

  if (!logoUrl) return null;

  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-xs">Logo Preview</Label>
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="Logo preview"
          className="size-12 rounded-md object-contain bg-white"
        />
        <span className="text-xs text-muted-foreground truncate min-w-0">
          {logoUrl}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Review Dialog
// ============================================================================

function ReviewDialog({
  contribution,
  open,
  onOpenChange,
  onAction,
  isLoading,
  canReview,
}: {
  contribution: ContributionWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (
    id: string,
    action: "approved" | "rejected",
    reviewNote: string,
  ) => void;
  isLoading: boolean;
  canReview: boolean;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const entityName =
    contribution.type === "bank"
      ? (contribution.data as BankContributionData).name.default
      : (contribution.data as MerchantContributionData).name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Contribution</DialogTitle>
          <DialogDescription>
            {actionConfig[contribution.action].label} request for &quot;
            {entityName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-x-auto">
          <div className="space-y-4 py-2">
            <DuplicateWarning contribution={contribution} />
            <DataPreview contribution={contribution} />
            <LogoPreview contribution={contribution} />

            {contribution.reason && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Contributor&apos;s reason
                  </Label>
                  <p className="text-sm mt-1">{contribution.reason}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="review-note">Review Note (optional)</Label>
              <Textarea
                id="review-note"
                placeholder="Add a note about your decision..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onAction(contribution.id, "rejected", reviewNote)}
            disabled={!canReview || isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            Reject
          </Button>
          <Button
            onClick={() => onAction(contribution.id, "approved", reviewNote)}
            disabled={!canReview || isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Import Result Dialog
// ============================================================================

function ImportResultDialog({
  result,
  open,
  onOpenChange,
}: {
  result: WeroImportResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {result.success ? "Import completed" : "Import failed"}
          </DialogTitle>
          <DialogDescription>
            {result.message ??
              (result.success
                ? "The Wero import ran successfully."
                : "The Wero import could not be completed.")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-4 py-2">
            {result.errors && result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>
                  {result.errors.length === 1
                    ? "1 error"
                    : `${result.errors.length} errors`}
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result.additions && result.additions.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {result.additions.length === 1
                    ? "1 addition"
                    : `${result.additions.length} additions`}
                </Label>
                <ul className="text-sm list-disc pl-4 space-y-0.5">
                  {result.additions.map((addition, i) => (
                    <li key={i}>{addition}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.updates && result.updates.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {result.updates.length === 1
                    ? "1 update"
                    : `${result.updates.length} updates`}
                </Label>
                <ul className="text-sm list-disc pl-4 space-y-0.5">
                  {result.updates.map((update, i) => (
                    <li key={i}>{update}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.success &&
              (result.additions?.length ?? 0) === 0 &&
              (result.updates?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">
                  No changes were found. Everything is already up to date.
                </p>
              )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Contribution Card
// ============================================================================

function ContributionCard({
  contribution,
  onReview,
}: {
  contribution: ContributionWithRelations;
  onReview: (c: ContributionWithRelations) => void;
}) {
  const entityName =
    contribution.type === "bank"
      ? (contribution.data as BankContributionData).name.default
      : (contribution.data as MerchantContributionData).name;

  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{entityName}</h3>
              <TypeBadge type={contribution.type} />
              <ActionBadge action={contribution.action} />
              <ContributionStatusBadge status={contribution.status} />
            </div>

            {/* Reason */}
            {contribution.reason && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                <MessageSquare size={16} className="inline mr-1 align-middle" />
                {contribution.reason}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Avatar size="sm">
                <AvatarImage
                  src={contribution.user.image ?? undefined}
                  alt={contribution.user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback>
                  {contribution.user.name
                    .split(" ", 2)
                    .map((p) => p[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span>{contribution.user.name}</span>
              <span>•</span>
              <span>
                {new Date(contribution.createdAt).toLocaleDateString()}
              </span>
              {contribution.reviewer && (
                <>
                  <span>•</span>
                  <span>Reviewed by {contribution.reviewer.name}</span>
                </>
              )}
            </div>

            {/* Review note */}
            {contribution.reviewNote && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                {contribution.reviewNote}
              </p>
            )}
          </div>

          {/* Actions */}
          {contribution.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(contribution)}
            >
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Stats card
// ============================================================================

function StatsCard({
  title,
  stat,
  className,
  loading,
}: {
  title: string;
  stat: number;
  className?: string;
  loading?: boolean;
}) {
  return (
    <Card className="py-4 gap-0">
      <CardHeader className="px-4">
        <CardDescription className="text-xs">{title}</CardDescription>
      </CardHeader>
      <CardContent className={cn("px-4", className)}>
        {loading ? (
          <Skeleton className="h-7 w-10 mb-1" />
        ) : (
          <p className="text-2xl font-bold">{stat}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ContributionCardSkeleton() {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Pagination helper
// ============================================================================

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

// ============================================================================
// Main Page
// ============================================================================

export function ContributionsPage({
  initialContributions = [],
  initialTotalCount = 0,
  initialCounts = { total: 0, pending: 0, approved: 0, rejected: 0 },
  currentUser = null,
  loading = false,
}: ContributionsPageProps) {
  const [items, setItems] = useState(initialContributions);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [counts, setCounts] = useState(initialCounts);
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | "all">(
    "pending",
  );
  const [typeFilter, setTypeFilter] = useState<ContributionType | "all">("all");
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] =
    useState<ContributionWithRelations | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<WeroImportResult | null>(
    null,
  );

  const isAdmin = currentUser?.role === "admin";
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / CONTRIBUTIONS_PAGE_SIZE),
  );

  const fetchContributions = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await getContributions(
        statusFilter === "all" ? undefined : statusFilter,
        typeFilter === "all" ? undefined : typeFilter,
        page,
      );
      setItems(result.contributions);
      setTotalCount(result.totalCount);
    } finally {
      setIsFetching(false);
    }
  }, [statusFilter, typeFilter, page]);

  // Skip the fetch on mount since the server already provided the initial page.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchContributions();
  }, [fetchContributions]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as ContributionStatus | "all");
    setPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value as ContributionType | "all");
    setPage(1);
  };

  const handleReviewAction = async (
    id: string,
    status: "approved" | "rejected",
    reviewNote: string,
  ) => {
    setIsSaving(true);
    try {
      const { success, message } = await rejectOrApproveContribution(
        id,
        status,
        reviewNote,
      );
      if (!success) {
        alert(message || "Failed to update contribution");
        return;
      }

      setReviewTarget(null);
      await Promise.all([
        fetchContributions(),
        getContributionCounts().then(setCounts),
      ]);
    } catch {
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualImport = async () => {
    setIsImporting(true);
    try {
      const result = await triggerWeroImport();
      setImportResult(result);
      if (result.success) {
        await Promise.all([
          fetchContributions(),
          getContributionCounts().then(setCounts),
        ]);
      }
    } catch {
      setImportResult({
        success: false,
        message: "An error occurred while running the import",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft size={18} />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Contributions</h1>
              <p className="text-xs text-muted-foreground">
                Review and manage community contributions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard title="Total" stat={counts.total} loading={loading} />
          <StatsCard
            title="Pending"
            stat={counts.pending}
            className="text-yellow-500"
            loading={loading}
          />
          <StatsCard
            title="Approved"
            stat={counts.approved}
            className="text-green-500"
            loading={loading}
          />
          <StatsCard
            title="Rejected"
            stat={counts.rejected}
            className="text-red-500"
            loading={loading}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-muted-foreground" />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(
                ([key, { label, icon: Icon }]) => (
                  <SelectItem key={key} value={key}>
                    <Icon size={16} />
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(typeConfig).map(
                ([key, { label, icon: Icon }]) => (
                  <SelectItem key={key} value={key}>
                    <Icon size={16} />
                    {label}s
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              `${totalCount} contribution${totalCount !== 1 ? "s" : ""}`
            )}
          </span>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
              Import from Wero API
            </Button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading || isFetching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ContributionCardSkeleton key={i} />
            ))
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No contributions found.</p>
              </CardContent>
            </Card>
          ) : (
            items.map((contribution) => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                onReview={setReviewTarget}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page <= 1 || isFetching}
                  className={cn(
                    (page <= 1 || isFetching) &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage((p) => p - 1);
                  }}
                />
              </PaginationItem>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      aria-disabled={isFetching}
                      className={cn(isFetching && "pointer-events-none")}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page >= totalPages || isFetching}
                  className={cn(
                    (page >= totalPages || isFetching) &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage((p) => p + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>

      {/* Review Dialog */}
      {reviewTarget && (
        <ReviewDialog
          contribution={reviewTarget}
          open={!!reviewTarget}
          onOpenChange={(open) => {
            if (!open) setReviewTarget(null);
          }}
          onAction={handleReviewAction}
          isLoading={isSaving}
          canReview={isAdmin}
        />
      )}

      {/* Import Result Dialog */}
      <ImportResultDialog
        result={importResult}
        open={!!importResult}
        onOpenChange={(open) => {
          if (!open) setImportResult(null);
        }}
      />
    </div>
  );
}
