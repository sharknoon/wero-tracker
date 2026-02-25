"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function SignInPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirect,
      });
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-background p-4">
      {/* Subtle radial gradient behind the card */}
      <div className="fixed inset-0 grid place-items-center">
        <div className="size-150 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <Card className="w-full max-w-sm border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
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
            Help users discover which banks and online shops support Wero.
            Thanks for contributing!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
