import { Fragment, useMemo } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotesTextProps {
  notes: string;
  className?: string;
}

/**
 * Parses text and converts URLs to clickable links.
 */
function parseNotesWithLinks(notes: string): React.ReactNode[] {
  // Regex to match URLs (http, https, www, or domain patterns like mydomain.de)
  const urlRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

  const parts = notes.split(urlRegex);

  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      // Check if this part is a URL
      if (urlRegex.test(part)) {
        const href = part.startsWith("www.") ? `https://${part}` : part;
        elements.push(
          <a
            key={`link-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>,
        );
      } else {
        elements.push(<Fragment key={`text-${index}`}>{part}</Fragment>);
      }
    }
  });

  return elements;
}

/**
 * Renders an info icon that shows notes in a popover on click.
 * URLs in the text are converted to clickable links.
 */
export function NotesText({ notes, className }: NotesTextProps) {
  const elements = useMemo(() => parseNotesWithLinks(notes), [notes]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
            className,
          )}
          aria-label="View notes"
        >
          <Info size={14} />
          <span className="text-xs leading-none translate-y-px">Info</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-xs md:max-w-md">
        <p className="text-sm leading-relaxed">{elements}</p>
      </PopoverContent>
    </Popover>
  );
}
