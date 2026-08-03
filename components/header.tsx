import {
  ChevronDown,
  GitPullRequestArrow,
  Info,
  Landmark,
  LogIn,
  LogOut,
  Plus,
  Store,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEditor } from "@/lib/editor-context";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/session-context";
import { ContributionType } from "@/db/schema/contributions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface HeaderProps {
  sourceRepository: string;
  contributionGuidelines: string;
  lastUpdated: Date;
}

function getInitials(name: string): string {
  return name
    .split(" ", 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AddButton() {
  const { openEditorDialog } = useEditor();
  const session = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleAdd(type: ContributionType) {
    if (!session?.user) {
      const target = searchParams?.size
        ? `${pathname}?${searchParams}`
        : pathname;
      redirect(`/sign-in?redirect=${encodeURIComponent(target)}`);
    }

    openEditorDialog({
      type,
      action: "add",
      submit: session.user.role === "admin" ? "admin" : "contribution",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleAdd("bank")}>
          <Landmark size={14} />
          Add missing bank
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAdd("merchant")}>
          <Store size={14} />
          Add missing online shop
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const session = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!session) {
    const target = searchParams?.size
      ? `${pathname}?${searchParams}`
      : pathname;
    return (
      <Button variant="outline" size="sm" asChild>
        <Link
          href={`/sign-in?redirect=${encodeURIComponent(target)}`}
          prefetch={false}
        >
          <LogIn size={16} />
          <span className="hidden sm:inline">Sign in</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full px-1">
          <Avatar size="sm">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "User avatar"}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="leading-none">{session.user.name}</p>
            <p className="text-xs text-muted-foreground leading-none">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/contributions" prefetch={false}>
            <GitPullRequestArrow size={14} />
            Contributions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => router.refresh() },
            })
          }
        >
          <LogOut size={14} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ sourceRepository, lastUpdated }: HeaderProps) {
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
              loading="eager"
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
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground cursor-pointer">
                  <Info size={14} />
                  Last updated: {lastUpdated.toLocaleDateString()}
                </div>
              </PopoverTrigger>
              <PopoverContent className="bg-popover text-popover-foreground border p-3 [&_svg]:bg-popover [&_svg]:fill-popover [&_svg]:border-b [&_svg]:border-e [&_svg]:translate-y-[calc(-50%+1px)] [&_svg]:rounded-none [&_svg]:rounded-br-[2px]">
                <p>Data is updated automatically every 24 hours.</p>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a
                href={sourceRepository}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub size={16} />
              </a>
            </Button>

            <AddButton />

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
