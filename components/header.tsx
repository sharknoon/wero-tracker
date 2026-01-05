import { ExternalLink, Info } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

export interface HeaderProps {
  sourceRepositoryLink: string;
  contributionGuideLink: string;
  lastUpdated: Date;
}

export function Header({
  sourceRepositoryLink,
  contributionGuideLink,
  lastUpdated,
}: HeaderProps) {
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
                Follow Wero&apos;s rollout across Europe&apos;s banks.
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
                <TooltipContent>
                  <p>Data is updated automatically every 24 hours.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href={contributionGuideLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hidden sm:inline">Contribute</span>
                <ExternalLink size={12} />
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a
                href={sourceRepositoryLink}
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
