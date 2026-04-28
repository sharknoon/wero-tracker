"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

// ============================================================================
// Types
// ============================================================================

interface ContributionsPageProps {
  contributions: ContributionWithRelations[];
  currentUser: { id: string; role: string } | null;
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
      name: b.name,
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
      ? (contribution.data as BankContributionData).name
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
      ? (contribution.data as BankContributionData).name
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
}: {
  title: string;
  stat: number;
  className?: string;
}) {
  return (
    <Card className="py-4 gap-0">
      <CardHeader className="px-4">
        <CardDescription className="text-xs">{title}</CardDescription>
      </CardHeader>
      <CardContent className={cn("px-4", className)}>
        <p className="text-2xl font-bold">{stat}</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export function ContributionsPage({
  contributions,
  currentUser,
}: ContributionsPageProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reviewTarget, setReviewTarget] =
    useState<ContributionWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canReview = currentUser?.role === "admin";

  const filtered = contributions.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    return true;
  });

  const counts = {
    total: contributions.length,
    pending: contributions.filter((c) => c.status === "pending").length,
    approved: contributions.filter((c) => c.status === "approved").length,
    rejected: contributions.filter((c) => c.status === "rejected").length,
  };

  const handleReviewAction = async (
    id: string,
    status: "approved" | "rejected",
    reviewNote: string,
  ) => {
    setIsLoading(true);
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
      router.refresh();
    } catch {
      alert("An error occurred");
    } finally {
      setIsLoading(false);
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
          <StatsCard title="Total" stat={counts.total} />
          <StatsCard
            title="Pending"
            stat={counts.pending}
            className="text-yellow-500"
          />
          <StatsCard
            title="Approved"
            stat={counts.approved}
            className="text-green-500"
          />
          <StatsCard
            title="Rejected"
            stat={counts.rejected}
            className="text-red-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            {filtered.length} contribution{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No contributions found.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((contribution) => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                onReview={setReviewTarget}
              />
            ))
          )}
        </div>
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
          isLoading={isLoading}
          canReview={canReview}
        />
      )}
    </div>
  );
}
