import { ToggleGroup } from "@navikt/ds-react";

export type Scope = "Min avdeling" | "Min enhet";
export type Period = "Ingen" | "Måned hittil" | "År hittil" | "Inneværende tertial" | "Egendefinert";

export const SCOPES: Scope[] = ["Min avdeling", "Min enhet"];
export const PERIODS: Period[] = ["Ingen", "Måned hittil", "År hittil", "Inneværende tertial", "Egendefinert"];

interface ScopeBarProps {
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  fraDato?: string;
  tilDato?: string;
  onFraDatoChange?: (d: string) => void;
  onTilDatoChange?: (d: string) => void;
}

export const ScopeBar = ({
  scope, onScopeChange, period, onPeriodChange,
  fraDato, tilDato, onFraDatoChange, onTilDatoChange,
}: ScopeBarProps) => {
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
      <div className="flex flex-wrap items-center gap-3">
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
        {period === "Egendefinert" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground sr-only" htmlFor="fra-dato">Fra</label>
            <input
              id="fra-dato"
              type="date"
              value={fraDato ?? ""}
              onChange={(e) => onFraDatoChange?.(e.target.value)}
              className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <label className="text-xs text-muted-foreground sr-only" htmlFor="til-dato">Til</label>
            <input
              id="til-dato"
              type="date"
              value={tilDato ?? ""}
              onChange={(e) => onTilDatoChange?.(e.target.value)}
              className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};
