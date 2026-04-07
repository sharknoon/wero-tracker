"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportStatus } from "@/db/schema/support";
import { ExternalLink, GripVertical, Pencil, Plus, X } from "lucide-react";
import { CountryFlag } from "./country-flag";
import { euCountries, supportStatusOptions } from "@/lib/constants";
import {
  DragDropProvider,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/react";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

// ============================================================================
// Website Input Component
// ============================================================================

export interface WebsiteInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

export function WebsiteInput({
  value,
  onChange,
  label = "Website",
  id = "website",
  placeholder = "https://example.com",
  required,
}: WebsiteInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        <Button variant="outline" size="icon" className="shrink-0" asChild>
          <a href={value} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Alias Input Component
// ============================================================================

export interface AliasInputProps {
  aliases: string[];
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (alias: string) => void;
  placeholder?: string;
}

export function AliasInput({
  aliases,
  aliasInput,
  onAliasInputChange,
  onAddAlias,
  onRemoveAlias,
  placeholder = "Add alias",
}: AliasInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="aliases">Aliases</Label>
      <div className="flex gap-2">
        <Input
          id="aliases"
          placeholder={placeholder}
          value={aliasInput}
          onChange={(e) => onAliasInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddAlias();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddAlias}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {aliases.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {aliases.map((alias) => (
            <span
              key={alias}
              className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
            >
              {alias}
              <button
                type="button"
                onClick={() => onRemoveAlias(alias)}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Country Selector Component
// ============================================================================

export interface CountrySelectorProps {
  countries: string[];
  onToggleCountry: (country: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CountrySelector({
  countries,
  onToggleCountry,
  required = true,
  disabled,
}: CountrySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>
        Countries {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
        {euCountries.map((country) => (
          <button
            key={country}
            type="button"
            onClick={() => onToggleCountry(country)}
            disabled={disabled}
            className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md transition-colors ${
              countries.includes(country)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <CountryFlag countryCode={country} size="sm" />
            {countryNames.of(country)}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Selected: {countries.join(", ") || "None"}
      </p>
    </div>
  );
}

// ============================================================================
// Support Status Select Component
// ============================================================================

export interface SupportStatusSelectProps {
  label: string;
  value: SupportStatus;
  onChange: (value: SupportStatus) => void;
  disabled?: boolean;
  required?: boolean;
}

export function SupportStatusSelect({
  label,
  value,
  onChange,
  disabled,
  required,
}: SupportStatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as SupportStatus)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {supportStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <option.icon className={option.iconColor} size={16} />
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// Country Group Selector Component
// ============================================================================

export interface CountryGroupSelectorProps {
  groups: string[][];
  onGroupsChange: (groups: string[][]) => void;
  selectedGroup: string[];
  onGroupSelect: (value: string[]) => void;
}

export function CountryGroupSelector({
  groups,
  onGroupsChange,
  selectedGroup,
  onGroupSelect,
}: CountryGroupSelectorProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<string[][]>([]);

  const openEditor = () => {
    setDraft(groups.map((g) => [...g]));
    setEditOpen(true);
  };

  const handleApply = () => {
    const cleaned = draft.filter((g) => g.length > 0);
    onGroupsChange(cleaned);
    setEditOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Country Groups</Label>
      <div className="flex items-center gap-2">
        <Tabs
          value={selectedGroup.sort().join(",")}
          onValueChange={(v) => onGroupSelect(v.split(","))}
          className="flex-1 min-w-0"
        >
          <TabsList className="w-full items-stretch h-auto!">
            {groups.map((group, index) => (
              <TabsTrigger
                key={index}
                value={group.sort().join(",")}
                className="gap-1 flex-wrap flex-initial h-auto!"
              >
                {group.map((country) => (
                  <CountryFlag key={country} countryCode={country} size="sm" />
                ))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={openEditor}
            >
              <Pencil size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[calc(100vh-2rem)] @container">
            <DialogHeader>
              <DialogTitle>Edit Country Groups</DialogTitle>
              <DialogDescription>
                Drag countries between groups to reorganize them.
              </DialogDescription>
            </DialogHeader>
            <CountryGroupDragEditor groups={draft} onGroupsChange={setDraft} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function DraggableCountry({ country }: { country: string }) {
  const { ref, isDragSource } = useDraggable({ id: country });

  return (
    <button
      ref={ref}
      type="button"
      className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md cursor-grab ${
        isDragSource
          ? "bg-primary text-primary-foreground"
          : "bg-secondary hover:bg-secondary/80"
      }`}
    >
      <GripVertical size={12} className="pointer-events-none" />
      <CountryFlag
        countryCode={country}
        size="sm"
        className="pointer-events-none"
      />
      <span className="pointer-events-none">{countryNames.of(country)}</span>
    </button>
  );
}

function DroppableGroup({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`flex flex-wrap gap-2 p-3 border rounded-md min-h-12 transition-colors m-px ${
        isDropTarget ? "border-primary bg-primary/5" : ""
      }`}
    >
      {children}
    </div>
  );
}

function CountryGroupDragEditor({
  groups,
  onGroupsChange,
}: {
  groups: string[][];
  onGroupsChange: (groups: string[][]) => void;
}) {
  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target) return;

    const country = String(source.id);
    const targetId = String(target.id);

    const without = groups.map((g) => g.filter((c) => c !== country));

    // If dropped on "New group" zone, create a new group with the dragged country
    if (targetId === "new-group") {
      onGroupsChange([...without.filter((g) => g.length > 0), [country]]);
      return;
    }

    const groupIdx = parseInt(targetId.replace("group-", ""));
    if (isNaN(groupIdx)) return;

    // If dropped on the same group as it was previously, do nothing
    if (groups[groupIdx]?.includes(country)) return;

    const next = without.map((g, i) => (i === groupIdx ? [...g, country] : g));
    onGroupsChange(next.filter((g) => g.length > 0));
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="space-y-3 overflow-y-auto max-h-[60cqh]">
        {groups.map((group, index) => (
          <div key={index} className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Group {index + 1}
            </span>
            <DroppableGroup id={`group-${index}`}>
              {group.map((country) => (
                <DraggableCountry key={country} country={country} />
              ))}
            </DroppableGroup>
          </div>
        ))}
      </div>
      <NewGroupDropZone />
    </DragDropProvider>
  );
}

function NewGroupDropZone() {
  const { ref, isDropTarget } = useDroppable({ id: "new-group" });

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-2 p-3 border border-dashed rounded-md text-sm text-muted-foreground transition-colors ${
        isDropTarget ? "border-primary bg-primary/5 text-primary" : ""
      }`}
    >
      <Plus className="size-4" />
      New group
    </div>
  );
}
