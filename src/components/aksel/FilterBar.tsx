import { cn } from "@/lib/utils";

interface FilterBarProps {
  scopes: string[];
  active: string;
  onChange: (scope: string) => void;
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (p: string) => void;
}

export const FilterBar = ({
  scopes,
  active,
  onChange,
  periods = ["I dag", "Denne uka", "Måned", "Tertial", "År"],
  activePeriod = "Denne uka",
  onPeriodChange,
}: FilterBarProps) => {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nivå</span>
        <div className="flex rounded-sm border border-border bg-surface-muted p-0.5">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={cn(
                "rounded-sm px-3 py-1 text-sm font-medium transition-colors",
                active === s
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
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Periode</span>
        <div className="flex rounded-sm border border-border bg-surface-muted p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={cn(
                "rounded-sm px-3 py-1 text-sm font-medium transition-colors",
                activePeriod === p
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
