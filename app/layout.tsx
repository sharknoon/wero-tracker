import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Wero Tracker - European Payment Adoption Progress",
  description:
    "Track Wero payment adoption across European banks. See which banks support P2P, online, and in-store payments.",
  appleWebApp: {
    title: "Wero Adoption Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body
        className={cn(
          "antialiased",
          fontMono.variable,
          "font-sans",
          geist.variable,
        )}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
