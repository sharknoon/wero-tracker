"use client";

import { useState } from "react";
import Image from "next/image";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Provider = "google" | "github";

export default function SignInPage() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      {/* Subtle radial gradient behind the card */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-150 w-150 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-sm border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/logos/wero.svg"
            alt="Wero Logo"
            width={96}
            height={30}
            className="mb-2"
            priority
          />
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to contribute to the Wero Adoption Tracker
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={() => handleSignIn("google")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SiGoogle className="size-4" />
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={() => handleSignIn("github")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "github" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SiGithub className="size-4" />
            )}
            Continue with GitHub
          </Button>

          <div className="relative my-1">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Wero Tracker
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to help track Wero&apos;s adoption across
            Europe&apos;s banks and merchants.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
