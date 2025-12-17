import { StatusDot } from "./status-badge";

export function Legend() {
  const items = [
    { status: "supported" as const, label: "Supported" },
    { status: "announced" as const, label: "Announced" },
    { status: "coming-soon" as const, label: "Coming Soon" },
    { status: "none" as const, label: "Not Available" },
  ];

  return (
    <div className="flex flex-wrap gap-4 rounded-lg bg-secondary/50 px-4 py-3">
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
