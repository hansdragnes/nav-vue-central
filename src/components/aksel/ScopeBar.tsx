import { ToggleGroup } from "@navikt/ds-react";

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
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Organisasjonsnivå
        </span>
        <ToggleGroup
          value={scope}
          onChange={(val) => val && onScopeChange(val as Scope)}
          size="small"
          variant="neutral"
        >
          {SCOPES.map((s) => (
            <ToggleGroup.Item key={s} value={s}>
              {s}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Periode
        </span>
        <ToggleGroup
          value={period}
          onChange={(val) => val && onPeriodChange(val as Period)}
          size="small"
          variant="neutral"
        >
          {PERIODS.map((p) => (
            <ToggleGroup.Item key={p} value={p}>
              {p}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};
