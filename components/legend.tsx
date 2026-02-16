import { StatusDot } from "./status-badge";

export function Legend() {
  const items = [
    { status: "supported" as const, label: "Supported" },
    { status: "announced" as const, label: "Announced" },
    { status: "unsupported" as const, label: "Unsupported" },
    { status: "unknown" as const, label: "Unknown" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card px-4 py-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Legend:
      </span>
      {items.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <StatusDot status={item.status} />
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
