import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; direction: "up" | "down"; positive?: boolean };
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "error" | "success";
}

const toneBar: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-primary",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
};

export const KpiCard = ({ label, value, delta, hint, icon: Icon, tone = "default" }: KpiCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-card p-5 shadow-sm">
      <span className={cn("absolute left-0 top-0 h-full w-1", toneBar[tone])} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-muted-foreground">{label}</div>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold",
              delta.positive ? "text-success" : "text-destructive",
            )}
          >
            {delta.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {delta.value}
          </span>
        ) : <span />}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
};
