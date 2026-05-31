/**
 * DirektorDashboard — NAV Kontroll Total
 *
 * Aggregert oversikt for øverste direktør.
 * Viser produksjonsnøkkeltall per enhet + totalt på tvers.
 * Ingen ansatt-detaljer – fokus på volum, flyt og økonomi.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckmarkCircleIcon,
  ClockDashedIcon,
  FolderIcon,
  HourglassIcon,
  PersonCrossIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Heading,
  HStack,
  ToggleGroup,
} from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Panel } from "@/components/aksel/Panel";
import { PERIODS, type Period } from "@/components/aksel/ScopeBar";
import { cn } from "@/lib/utils";
import {
  CASES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  UNITS,
  OKONOMISK_PER_ENHET,
  type CaseStatus,
  type Unit,
} from "@/data/cases";

// ─── Konstanter ───────────────────────────────────────────────────────────────

const FRIST_DAGER = 30;

const ENHET_FARGE: Record<Unit, string> = {
  "Kontroll Øst":  "hsl(211 100% 39%)",
  "Kontroll Vest": "hsl(145 63% 32%)",
  "Kontroll Nord": "hsl(28 90% 50%)",
  "Analyse":       "hsl(280 50% 52%)",
};

const STATUS_FARGE: Record<CaseStatus, string> = {
  "Ny":                        "hsl(211 100% 39%)",
  "Utredes":                   "hsl(211 100% 60%)",
  "Strafferettslig vurdering": "hsl(280 50% 55%)",
  "Venter på forvaltning":     "hsl(28 90% 55%)",
  "Venter på politi":          "hsl(35 100% 47%)",
  "Henlagt":                   "hsl(213 67% 30%)",
  "Avsluttet":                 "hsl(145 63% 28%)",
};

function krFormat(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")} mill.`;
  if (v >= 1_000)     return `${Math.round(v / 1_000)} t.`;
  return `${v}`;
}

// ─── Delkomponenter ───────────────────────────────────────────────────────────

/** Kompakt KPI-rad for én enhet */
function EnhetKort({
  enhet, cases, onClick,
}: {
  enhet: Unit;
  cases: typeof CASES;
  onClick: () => void;
}) {
  const åpne      = cases.filter((c) => c.status !== "Avsluttet" && c.status !== "Henlagt");
  const innkomne  = cases.filter((c) => c.status === "Ny").length;
  const utredes   = cases.filter((c) => c.status === "Utredes").length;
  const avsluttet = cases.filter((c) => c.status === "Avsluttet").length;
  const venter    = cases.filter((c) => c.status === "Venter på forvaltning" || c.status === "Venter på politi").length;
  const overFrist = åpne.filter((c) => c.ageDays > FRIST_DAGER).length;
  const uTildelt  = åpne.filter((c) => c.employeeId === null).length;
  const total     = cases.length;

  const ok = OKONOMISK_PER_ENHET[enhet];

  const kpier = [
    { label: "Totalt",       verdi: total,     farge: "text-foreground",         ikon: <FolderIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Innkomne",     verdi: innkomne,  farge: "text-foreground",         ikon: <PlusIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Utredes",      verdi: utredes,   farge: "text-foreground",         ikon: <HourglassIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Avsluttet",    verdi: avsluttet, farge: "text-success",            ikon: <CheckmarkCircleIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Venter",       verdi: venter,    farge: venter > 0 ? "text-warning-foreground" : "text-foreground", ikon: <ClockDashedIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Over frist",   verdi: overFrist, farge: overFrist > 0 ? "text-destructive" : "text-muted-foreground", ikon: <ClockDashedIcon aria-hidden className="h-3.5 w-3.5" /> },
    { label: "Ikke tildelt", verdi: uTildelt,  farge: uTildelt > 0 ? "text-warning-foreground" : "text-muted-foreground", ikon: <PersonCrossIcon aria-hidden className="h-3.5 w-3.5" /> },
  ];

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-sm border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all overflow-hidden"
    >
      {/* Header: enhetsnavn + fargestripe */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="h-3 w-3 rounded-full shrink-0" style={{ background: ENHET_FARGE[enhet] }} />
        <span className="font-semibold text-sm text-foreground">{enhet}</span>
        <span className="ml-auto text-xs text-muted-foreground">{total} saker</span>
      </div>

      {/* KPI-grid */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {kpier.slice(0, 4).map((k) => (
          <div key={k.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
            <span className={cn("text-2xl font-bold tabular-nums leading-none", k.farge)}>{k.verdi}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{k.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {kpier.slice(4).map((k) => (
          <div key={k.label} className="flex flex-col items-center py-2.5 px-2 gap-0.5">
            <span className={cn("text-xl font-bold tabular-nums leading-none", k.farge)}>{k.verdi}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Økonomi-rad */}
      <div className="grid grid-cols-2 divide-x divide-border px-0">
        <div className="flex flex-col px-4 py-2.5">
          <span className="text-[10px] text-muted-foreground">Stanset</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">{krFormat(ok.totaltStanset)} kr</span>
        </div>
        <div className="flex flex-col px-4 py-2.5">
          <span className="text-[10px] text-muted-foreground">Innsparing</span>
          <span className="text-sm font-semibold tabular-nums text-success">{krFormat(ok.totaltInnsparing)} kr</span>
        </div>
      </div>
    </button>
  );
}

/** Aggregert totalrad for alle enheter */
function TotalRad({ cases }: { cases: typeof CASES }) {
  const åpne      = cases.filter((c) => c.status !== "Avsluttet" && c.status !== "Henlagt");
  const avsluttet = cases.filter((c) => c.status === "Avsluttet").length;
  const venter    = cases.filter((c) => c.status === "Venter på forvaltning" || c.status === "Venter på politi").length;
  const overFrist = åpne.filter((c) => c.ageDays > FRIST_DAGER).length;
  const uTildelt  = åpne.filter((c) => c.employeeId === null).length;

  const totalOk = UNITS.reduce((acc, u) => {
    const ok = OKONOMISK_PER_ENHET[u];
    return {
      stanset:      acc.stanset      + ok.totaltStanset,
      innsparing:   acc.innsparing   + ok.totaltInnsparing,
      tilbakekreving: acc.tilbakekreving + ok.totaltTilbakekreving,
    };
  }, { stanset: 0, innsparing: 0, tilbakekreving: 0 });

  const kpier = [
    { label: "Totalt",       verdi: cases.length, farge: "text-foreground" },
    { label: "Avsluttet",    verdi: avsluttet,    farge: "text-success" },
    { label: "Venter",       verdi: venter,       farge: venter > 0 ? "text-warning-foreground" : "text-foreground" },
    { label: "Over frist",   verdi: overFrist,    farge: overFrist > 0 ? "text-destructive" : "text-muted-foreground" },
    { label: "Ikke tildelt", verdi: uTildelt,     farge: uTildelt > 0 ? "text-warning-foreground" : "text-muted-foreground" },
  ];

  return (
    <div className="rounded-sm border border-primary/30 bg-primary/5 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/20">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">NAV Kontroll — totalt</span>
      </div>
      <div className="grid grid-cols-5 divide-x divide-border">
        {kpier.map((k) => (
          <div key={k.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
            <span className={cn("text-3xl font-bold tabular-nums leading-none", k.farge)}>{k.verdi}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{k.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 divide-x divide-border border-t border-primary/20">
        {[
          { label: "Totalt stanset",   verdi: totalOk.stanset,       farge: "text-foreground" },
          { label: "Innsparing",       verdi: totalOk.innsparing,    farge: "text-success" },
          { label: "Tilbakekreving",   verdi: totalOk.tilbakekreving, farge: "text-foreground" },
        ].map((k) => (
          <div key={k.label} className="flex flex-col items-center py-2.5 px-2">
            <span className={cn("text-lg font-bold tabular-nums leading-none", k.farge)}>{krFormat(k.verdi)} kr</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{k.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stacked sakstype × status ────────────────────────────────────────────────

function StackedSakstypeStatus({
  cases,
  onKlikk,
}: {
  cases: { category: string; status: string }[];
  onKlikk: (params: Record<string, string>) => void;
}) {
  const data = useMemo(() => {
    return CASE_CATEGORIES.map((cat) => {
      const rad: Record<string, string | number> = { navn: cat };
      CASE_STATUSES.forEach((s) => {
        rad[s] = cases.filter((c) => c.category === cat && c.status === s).length;
      });
      return rad;
    }).sort((a, b) => {
      const sumA = CASE_STATUSES.reduce((s, k) => s + (a[k] as number), 0);
      const sumB = CASE_STATUSES.reduce((s, k) => s + (b[k] as number), 0);
      return sumB - sumA;
    });
  }, [cases]);

  const høyde = Math.max(200, CASE_CATEGORIES.length * 44 + 40);

  return (
    <div role="img" aria-label="Saker per sakstype fordelt på status">
      <ResponsiveContainer width="100%" height={høyde}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="navn"
            width={130}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            stroke="hsl(var(--border))"
          />
          <RechartsTooltip
            cursor={{ fill: "hsl(var(--surface-subtle))" }}
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
            formatter={(v: number, name: string) => [`${v} saker`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
          />
          {CASE_STATUSES.map((s) => (
            <Bar
              key={s}
              dataKey={s}
              stackId="a"
              fill={STATUS_FARGE[s as CaseStatus]}
              isAnimationActive={false}
              barSize={22}
              style={{ cursor: "pointer" }}
              onClick={(entry) => onKlikk({ kategori: entry.navn as string, status: s })}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-muted-foreground text-center">
        Klikk et segment for å åpne filtrert saksoversikt
      </p>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

export default function DirektorDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("Ingen");
  const [fraDato, setFraDato] = useState("");
  const [tilDato, setTilDato] = useState("");

  const allCases = useMemo(() => {
    if (period === "Ingen") return CASES;
    if (period === "Måned hittil") return CASES.filter((c) => c.ageDays <= 30);
    if (period === "År hittil")    return CASES.filter((c) => c.ageDays <= 365);
    if (period === "Inneværende tertial") return CASES.filter((c) => c.ageDays <= 122);
    if (period === "Egendefinert") {
      return CASES.filter((c) => {
        if (fraDato && c.createdAt < fraDato) return false;
        if (tilDato && c.createdAt > tilDato) return false;
        return true;
      });
    }
    return CASES;
  }, [period, fraDato, tilDato]);

  // Cases per enhet
  const casesPerEnhet = useMemo(
    () => Object.fromEntries(UNITS.map((u) => [u, allCases.filter((c) => c.unit === u)])) as Record<Unit, typeof CASES>,
    [allCases],
  );

  // Gruppert søylediagram: status per enhet
  const statusPerEnhetData = useMemo(() => {
    return CASE_STATUSES.map((s) => {
      const rad: Record<string, string | number> = { status: s };
      UNITS.forEach((u) => {
        rad[u] = casesPerEnhet[u].filter((c) => c.status === s).length;
      });
      return rad;
    });
  }, [casesPerEnhet]);

  // Utredningstrakt totalt
  const traktSteg = useMemo(() => [
    { label: "Innkomne",       status: "Ny" as CaseStatus,                          farge: "hsl(211 100% 39%)" },
    { label: "Utredes",        status: "Utredes" as CaseStatus,                     farge: "hsl(211 100% 52%)" },
    { label: "Strafferettslig",status: "Strafferettslig vurdering" as CaseStatus,   farge: "hsl(280 50% 52%)" },
    { label: "Venter",         status: null,                                         farge: "hsl(28 90% 52%)" },
    { label: "Avsluttet",      status: "Avsluttet" as CaseStatus,                   farge: "hsl(145 63% 28%)" },
    { label: "Henlagt",        status: "Henlagt" as CaseStatus,                     farge: "hsl(213 67% 30%)" },
  ].map((s) => ({
    ...s,
    antall: s.status === null
      ? allCases.filter((c) => c.status === "Venter på forvaltning" || c.status === "Venter på politi").length
      : allCases.filter((c) => c.status === s.status).length,
  })), [allCases]);

  return (
    <div className="space-y-5">

      {/* ── Periodefilter ── */}
      <div className="rounded-sm border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Periode</span>
        <ToggleGroup value={period} onChange={(v) => v && setPeriod(v as Period)} size="small" variant="neutral">
          {PERIODS.map((p) => (
            <ToggleGroup.Item key={p} value={p}>{p}</ToggleGroup.Item>
          ))}
        </ToggleGroup>
        {period === "Egendefinert" && (
          <div className="flex items-center gap-2">
            <input type="date" value={fraDato} onChange={(e) => setFraDato(e.target.value)}
              className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <span className="text-xs text-muted-foreground">–</span>
            <input type="date" value={tilDato} onChange={(e) => setTilDato(e.target.value)}
              className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        )}
      </div>

      {/* ── Totalrad ── */}
      <TotalRad cases={allCases} />

      {/* ── Enheter: 2×2 grid ── */}
      <section aria-labelledby="enheter-heading">
        <Heading level="2" size="xsmall" id="enheter-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Per enhet
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {UNITS.map((u) => (
            <EnhetKort
              key={u}
              enhet={u}
              cases={casesPerEnhet[u]}
              onClick={() => navigate(`/saksoversikt?enhet=${encodeURIComponent(u)}`)}
            />
          ))}
        </div>
      </section>

      {/* ── Grafpanel: statusfordeling per enhet + trakt ── */}
      <Panel title="Produksjonsbilder" description="Klikk søyler for detaljer">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Gruppert søyle: status per enhet */}
          <div className="xl:col-span-2 min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Statusfordeling per enhet
            </p>
            <div role="img" aria-label="Statusfordeling per enhet">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={statusPerEnhetData}
                  margin={{ left: 0, right: 8, top: 4, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                    stroke="hsl(var(--border))"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
                    formatter={(v: number, name: string) => [`${v} saker`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
                  />
                  {UNITS.map((u) => (
                    <Bar key={u} dataKey={u} fill={ENHET_FARGE[u]} isAnimationActive={false} barSize={14} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Utredningstrakt totalt */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Utredningstrakt — totalt
            </p>
            <div className="flex flex-col items-center gap-1 w-full select-none">
              {traktSteg.map((s, i) => {
                const maks = traktSteg[0].antall || 1;
                const pct = 28 + (s.antall / maks) * 72;
                const erSiste = i === traktSteg.length - 1;
                return (
                  <div key={s.label} className="w-full flex flex-col items-center">
                    <div
                      className="flex flex-col items-center justify-center rounded-sm py-2.5"
                      style={{ width: `${pct}%`, background: s.farge, minHeight: 48 }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{s.label}</span>
                      <span className="text-2xl font-bold tabular-nums text-white leading-tight">{s.antall}</span>
                    </div>
                    {!erSiste && (
                      <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[8px] border-l-transparent border-r-transparent"
                        style={{ borderTopColor: s.farge, opacity: 0.5 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Saksoversikt: sakstype × status ── */}
      <Panel title="Saker per sakstype og status" description="Horisontalt stablet – klikk segment for filtrert saksoversikt">
        <StackedSakstypeStatus cases={allCases} onKlikk={(params) => {
          const sp = new URLSearchParams();
          if (params.kategori) sp.set("kategori", params.kategori);
          if (params.status)   sp.set("status",   params.status);
          navigate(`/saksoversikt?${sp.toString()}`);
        }} />
      </Panel>

      {/* ── Økonomi sammenstilling ── */}
      <Panel title="Økonomi per enhet" description="Forrige måned · Mock-tall for prototype">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-6 text-xs font-semibold text-muted-foreground">Enhet</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-muted-foreground">Høyeste stanset</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-muted-foreground">Totalt stanset</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-muted-foreground">Innsparing</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-muted-foreground">Tilbakekreving</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => {
                const ok = OKONOMISK_PER_ENHET[u];
                return (
                  <tr key={u} className="border-b border-border/60 hover:bg-surface-subtle">
                    <td className="py-2.5 pr-6">
                      <HStack gap="2" align="center">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ENHET_FARGE[u] }} />
                        <span className="font-medium">{u}</span>
                      </HStack>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{ok.hoyesteBelopStanset.toLocaleString("nb-NO")} kr</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold">{ok.totaltStanset.toLocaleString("nb-NO")} kr</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-success font-semibold">{ok.totaltInnsparing.toLocaleString("nb-NO")} kr</td>
                    <td className="py-2.5 px-4 text-right tabular-nums">{ok.totaltTilbakekreving.toLocaleString("nb-NO")} kr</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-subtle">
                <td className="py-2.5 pr-6 font-bold text-xs uppercase tracking-wide text-primary">Totalt</td>
                {(["hoyesteBelopStanset", "totaltStanset", "totaltInnsparing", "totaltTilbakekreving"] as const).map((key) => {
                  const sum = UNITS.reduce((a, u) => a + OKONOMISK_PER_ENHET[u][key], 0);
                  const erInnsparing = key === "totaltInnsparing";
                  return (
                    <td key={key} className={cn("py-2.5 px-4 text-right tabular-nums font-bold", erInnsparing ? "text-success" : "")}>
                      {sum.toLocaleString("nb-NO")} kr
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  );
}
