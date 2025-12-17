import { Github, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  dataSource: string;
  lastUpdated: string;
}

export function Header({ dataSource, lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              W
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Wero Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                European Payment Adoption Progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                    <Info size={14} />
                    Last updated: {new Date(lastUpdated).toLocaleDateString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border">
                  <p>Data is updated via community contributions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-secondary border-border"
              asChild
            >
              <a href={dataSource} target="_blank" rel="noopener noreferrer">
                <Github size={16} />
                <span className="hidden sm:inline">Contribute</span>
                <ExternalLink size={12} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
