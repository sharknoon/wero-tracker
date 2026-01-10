import { Info, Landmark, Plus, Store } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContribution } from "@/lib/contribution-context";

export interface HeaderProps {
  sourceRepository: string;
  contributionGuidelines: string;
  lastUpdated: Date;
}

export function Header({ sourceRepository, lastUpdated }: HeaderProps) {
  const { openAddBankBrandDialog, openAddMerchantDialog } = useContribution();
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Image
              src="/logos/wero.svg"
              alt="Wero Logo"
              width={128}
              height={40}
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Unofficial Wero Adoption Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                Follow Wero&apos;s rollout across Europe&apos;s banks and online
                shops.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Info size={14} />
                    Last updated: {lastUpdated.toLocaleDateString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border p-3 [&_svg]:bg-popover [&_svg]:fill-popover [&_svg]:border-b [&_svg]:border-e [&_svg]:translate-y-[calc(-50%+1px)] [&_svg]:rounded-none [&_svg]:rounded-br-[2px]">
                  <p>Data is updated automatically every 24 hours.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openAddBankBrandDialog}>
                  <Landmark size={14} />
                  Add missing bank
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openAddMerchantDialog}>
                  <Store size={14} />
                  Add missing online shop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a
                href={sourceRepository}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub size={16} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
