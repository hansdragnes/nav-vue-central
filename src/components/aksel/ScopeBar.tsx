import { cn } from "@/lib/utils";

export type Scope = "Min avdeling" | "Min enhet";
export type Period = "Ingen" | "Måned hittil" | "År hittil" | "Inneværende tertial";

export const SCOPES: Scope[] = ["Min avdeling", "Min enhet"];
export const PERIODS: Period[] = ["Ingen", "Måned hittil", "År hittil", "Inneværende tertial"];

interface ScopeBarProps {
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export const ScopeBar = ({ scope, onScopeChange, period, onPeriodChange }: ScopeBarProps) => {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Organisasjonsnivå
        </span>
        <div className="flex rounded-sm border border-border bg-surface-muted p-0.5">
          {SCOPES.map((s) => (
            <button
              key={s}
              onClick={() => onScopeChange(s)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                scope === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Periode
        </span>
        <div className="flex rounded-sm border border-border bg-surface-muted p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                period === p
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
