import "flag-icons/css/flag-icons.min.css";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-base rounded-xs",
  md: "text-2xl rounded-sm",
  lg: "text-4xl rounded",
};

export function CountryFlag({
  countryCode,
  size = "md",
  className,
}: CountryFlagProps) {
  // flag-icons uses lowercase ISO 3166-1-alpha-2 codes
  const code = countryCode.toLowerCase();

  return (
    <span
      className={cn(`fi fi-${code}`, sizeClasses[size], className)}
      role="img"
      aria-label={`Flag of ${countryCode}`}
    />
  );
}
