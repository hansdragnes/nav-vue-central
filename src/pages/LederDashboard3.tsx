/**
 * LederDashboard3 — eksperimentell visualisering
 *
 * Toggle mellom:
 *   Visning A (klassisk):  søylediagram, donut, tabell med workload-meter, KPI-kort
 *   Visning B (alternativ): treemap, bubble chart, heatmap-grid, stat-strip
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChartIcon,
  CheckmarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockDashedIcon,
  InformationSquareIcon,
  HourglassIcon,
  PersonCrossIcon,
  PersonGroupIcon,
  PlusIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Heading,
  HGrid,
  HStack,
  Table,
  ToggleGroup,
  VStack,
} from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Tooltip as RechartsTooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
  Legend,
} from "recharts";
import { ScopeBar, type Period, type Scope } from "@/components/aksel/ScopeBar";import { Panel } from "@/components/aksel/Panel";
import { cn } from "@/lib/utils";
import {
  ACTIVE_STATUSES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  CASES,
  EMPLOYEES,
  OKONOMISK,
  type CaseStatus,
} from "@/data/cases";

// ─── Konstanter ───────────────────────────────────────────────────────────────

const FRIST_DAGER = 30;
const KAPASITET_MAKS = 20;

const STATUS_FARGE: Record<CaseStatus, string> = {
  "Ny":                       "hsl(211 100% 39%)",
  "Utredes":                  "hsl(211 100% 60%)",
  "Strafferettslig vurdering":"hsl(280 50% 55%)",
  "Venter på forvaltning":    "hsl(28 90% 55%)",
  "Venter på politi":         "hsl(35 100% 47%)",
  "Henlagt":                  "hsl(213 67% 30%)",
  "Avsluttet":                "hsl(145 63% 28%)",
};

const KATEGORI_FARGER = [
  "hsl(211 100% 39%)",
  "hsl(145 63% 35%)",
  "hsl(35 100% 47%)",
  "hsl(280 50% 55%)",
  "hsl(213 67% 30%)",
  "hsl(0 70% 50%)",
  "hsl(190 70% 40%)",
  "hsl(45 90% 50%)",
];

type Visning = "klassisk" | "alternativ";

// ─── Hjelpere ────────────────────────────────────────────────────────────────

function formatDato(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function medianAv(tall: number[]): number {
  if (!tall.length) return 0;
  const s = [...tall].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function saksoversiktUrl(params: Record<string, string>): string {
  return `/saksoversikt?${new URLSearchParams(params)}`;
}

// ─── Kombinert panel: stacked bar + kakediagram ───────────────────────────────

/**
 * Stacked horisontalt søylediagram: én rad per sakstype, segmentert per status.
 * Gir lederen innsyn i hvilke sakstyper som hoper seg opp i hvilken status.
 */
function StackedStatusKategori({
  cases, onKlikk,
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
          layout="vertical" data={data}
          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" allowDecimals={false} />
          <YAxis type="category" dataKey="navn" width={120} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} stroke="hsl(var(--border))" />
          <RechartsTooltip
            cursor={{ fill: "hsl(var(--surface-subtle))" }}
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
            formatter={(v: number, name: string) => [`${v} saker`, name]}
          />
          {CASE_STATUSES.map((s) => (
            <Bar
              key={s} dataKey={s} stackId="a"
              fill={STATUS_FARGE[s as CaseStatus]}
              isAnimationActive={false}
              barSize={22}
              style={{ cursor: "pointer" }}
              onClick={(entry) => onKlikk({ kategori: entry.navn as string, status: s })}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-muted-foreground text-center">Klikk et segment for å åpne filtrert saksoversikt</p>
    </div>
  );
}

// ─── Visning A: klassiske komponenter ────────────────────────────────────────

/** Nøkkeltallkort */
function NkKort({
  tittel, verdi, enhet, ikon, tone = "default", hint, onClick,
}: {
  tittel: string; verdi: number | string; enhet?: string;
  ikon: React.ReactNode; tone?: "default" | "advarsel" | "feil" | "suksess";
  hint?: string; onClick?: () => void;
}) {
  const ikonKls: Record<string, string> = {
    default:  "bg-secondary text-primary",
    advarsel: "bg-warning-surface/60 text-warning-foreground",
    feil:     "bg-destructive-surface text-destructive",
    suksess:  "bg-success-surface/60 text-success",
  };
  const Komp = onClick ? "button" : "div";
  return (
    <Komp
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-sm border border-border bg-card p-4 shadow-sm text-left w-full",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/40 transition-shadow",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <BodyShort size="small" className="font-medium text-muted-foreground leading-snug">{tittel}</BodyShort>
        <div className={cn("shrink-0 rounded-md p-1.5", ikonKls[tone])}>{ikon}</div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tabular-nums text-foreground">{verdi}</span>
          {enhet && <span className="text-sm text-muted-foreground">{enhet}</span>}
        </div>
        {hint && <BodyShort size="small" className="mt-0.5 text-muted-foreground">{hint}</BodyShort>}
      </div>
      {onClick && <BodyShort size="small" className="text-primary font-medium">Se saker →</BodyShort>}
    </Komp>
  );
}

/** Horisontalt søylediagram */
function Soylediagram({
  data, ariaLabel, onBarClick,
}: {
  data: { navn: string; antall: number; farge?: string }[];
  ariaLabel: string;
  onBarClick?: (navn: string) => void;
}) {
  const høyde = Math.max(180, data.length * 44 + 40);
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={høyde}>
        <BarChart
          layout="vertical" data={data}
          margin={{ left: 0, right: 48, top: 4, bottom: 4 }}
          onClick={(e) => { if (onBarClick && e?.activeLabel) onBarClick(String(e.activeLabel)); }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" allowDecimals={false} />
          <YAxis type="category" dataKey="navn" width={148} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} stroke="hsl(var(--border))" />
          <RechartsTooltip
            cursor={{ fill: "hsl(var(--surface-subtle))" }}
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
            formatter={(v: number) => [`${v} saker`]}
          />
          <Bar dataKey="antall" radius={[0, 3, 3, 0]} barSize={22} cursor={onBarClick ? "pointer" : undefined} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={d.navn} fill={d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length]} />)}
            <LabelList dataKey="antall" position="right" style={{ fontSize: 12, fontWeight: 600, fill: "hsl(var(--foreground))" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Workload-meter */
function WorkloadMeter({ aktive, overFrist }: { aktive: number; overFrist: number }) {
  const pct = Math.min(100, Math.round((aktive / KAPASITET_MAKS) * 100));
  const farge = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", farge)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">{aktive}</span>
      {overFrist > 0 && <span className="text-xs font-semibold text-destructive shrink-0">+{overFrist}f</span>}
    </div>
  );
}

// ─── Visning B: alternative visualiseringer ───────────────────────────────────

/**
 * Stat-strip: kompakt horisontal rad med store tall og trend-badge.
 * Erstatter de individuelle KPI-kortene.
 */
function StatStrip({
  stats, onKlikk,
}: {
  stats: { tittel: string; verdi: number | string; tone?: string; hint?: string; param?: Record<string, string> }[];
  onKlikk: (params: Record<string, string>) => void;
}) {
  const farge: Record<string, string> = {
    feil:     "text-destructive",
    advarsel: "text-warning-foreground",
    suksess:  "text-success",
    default:  "text-foreground",
  };
  return (
    <div className="flex flex-wrap divide-x divide-border rounded-sm border border-border bg-card shadow-sm overflow-hidden">
      {stats.map((s) => (
        <button
          key={s.tittel}
          onClick={() => s.param && onKlikk(s.param)}
          className={cn(
            "flex-1 min-w-[120px] flex flex-col gap-0.5 px-5 py-4 text-left transition-colors",
            s.param ? "cursor-pointer hover:bg-surface-subtle" : "cursor-default",
          )}
        >
          <BodyShort size="small" className="text-muted-foreground font-medium whitespace-nowrap">{s.tittel}</BodyShort>
          <span className={cn("text-4xl font-bold tabular-nums leading-none", farge[s.tone ?? "default"])}>
            {s.verdi}
          </span>
          {s.hint && <BodyShort size="small" className="text-muted-foreground">{s.hint}</BodyShort>}
        </button>
      ))}
    </div>
  );
}

/**
 * Treemap: areal = antall saker, farge = status.
 * Erstatter horisontalt søylediagram for statusfordeling.
 */
function StatusTreemap({
  data, onKlikk,
}: {
  data: { navn: string; antall: number; farge: string }[];
  onKlikk: (navn: string) => void;
}) {
  const treemapData = {
    name: "root",
    children: data.map((d) => ({ name: d.navn, size: d.antall, farge: d.farge })),
  };

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, size, farge } = props;
    if (width < 30 || height < 20) return null;
    return (
      <g
        onClick={() => onKlikk(name)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={x + 1} y={y + 1}
          width={width - 2} height={height - 2}
          fill={farge}
          rx={3}
          opacity={0.92}
        />
        {width > 60 && height > 32 && (
          <>
            <text
              x={x + width / 2} y={y + height / 2 - (height > 50 ? 10 : 0)}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize={Math.min(13, width / 7)}
              fontWeight={600}
              style={{ pointerEvents: "none" }}
            >
              {name}
            </text>
            {height > 50 && (
              <text
                x={x + width / 2} y={y + height / 2 + 14}
                textAnchor="middle" dominantBaseline="middle"
                fill="rgba(255,255,255,0.85)" fontSize={11}
                style={{ pointerEvents: "none" }}
              >
                {size} saker
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <div role="img" aria-label={`Treemap over saker per status: ${data.map((d) => `${d.navn} ${d.antall}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height={320}>
        <Treemap
          data={treemapData.children}
          dataKey="size"
          content={<CustomContent />}
          isAnimationActive={false}
        >
          <RechartsTooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
            formatter={(v: number, _: string, props: any) => [`${v} saker`, props?.payload?.name ?? ""]}
          />
        </Treemap>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-muted-foreground">Klikk en flate for å åpne filtrert saksoversikt</p>
    </div>
  );
}

/**
 * Bubble chart: X = kategoriindeks, Y = antall, Z = antall (boble-størrelse).
 * Erstatter søylediagram + donut for kategorifordeling.
 */
function KategoriBubbleChart({
  data, onKlikk,
}: {
  data: { navn: string; antall: number; farge: string; x: number }[];
  onKlikk: (navn: string) => void;
}) {
  return (
    <div>
      <div role="img" aria-label={`Bubble chart over saker per kategori: ${data.map((d) => `${d.navn} ${d.antall}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ left: 0, right: 20, top: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, data.length - 0.5]}
              ticks={data.map((d) => d.x)}
              tickFormatter={(v) => data[v]?.navn ?? ""}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              type="number"
              dataKey="antall"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
              allowDecimals={false}
              label={{ value: "Antall saker", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }}
            />
            <ZAxis type="number" dataKey="antall" range={[300, 2200]} />
            <RechartsTooltip
              cursor={false}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
              formatter={(v: number, _: string, props: any) => [`${v} saker`, props?.payload?.navn ?? ""]}
            />
            <Scatter
              data={data}
              onClick={(entry) => onKlikk(entry.navn)}
              style={{ cursor: "pointer" }}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.navn} fill={d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length]} fillOpacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-muted-foreground">Boble-størrelse og høyde viser antall saker · Klikk for å filtrere</p>
    </div>
  );
}

/**
 * Heatmap-grid: ansatte på rader, dimensjoner på kolonner.
 * Farge-intensitet = verdi relativ til maks i kolonnen.
 * Erstatter tabell med workload-meter.
 */
function KapasitetHeatmap({
  ansatte, onKlikk,
}: {
  ansatte: { id: string; navn: string; enhet: string; aktive: number; ferdig: number; overFrist: number; tildelte: number }[];
  onKlikk: (id: string) => void;
}) {
  const kolonner = [
    { key: "tildelte",  label: "Tildelte",    tone: "blaa" },
    { key: "aktive",    label: "Aktive",       tone: "blaa" },
    { key: "ferdig",    label: "Ferdigstilte", tone: "gronn" },
    { key: "overFrist", label: "Over frist",   tone: "roed" },
  ] as const;

  const maks: Record<string, number> = {};
  kolonner.forEach((k) => {
    maks[k.key] = Math.max(...ansatte.map((a) => a[k.key]), 1);
  });

  function celleFarge(tone: string, verdi: number, maksVerdi: number): string {
    const styrke = verdi / maksVerdi;
    if (verdi === 0) return "hsl(var(--surface-subtle))";
    if (tone === "roed")  return `hsla(4, 71%, 47%, ${0.15 + styrke * 0.75})`;
    if (tone === "gronn") return `hsla(145, 63%, 28%, ${0.12 + styrke * 0.65})`;
    return `hsla(211, 100%, 39%, ${0.10 + styrke * 0.60})`;
  }

  function tekstFarge(tone: string, verdi: number, maksVerdi: number): string {
    const styrke = verdi / maksVerdi;
    if (verdi === 0) return "hsl(var(--muted-foreground))";
    if (styrke > 0.6) return "white";
    if (tone === "roed")  return "hsl(4, 71%, 35%)";
    if (tone === "gronn") return "hsl(145, 63%, 20%)";
    return "hsl(211, 100%, 28%)";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" role="grid" aria-label="Kapasitetsheatmap per saksbehandler">
        <thead>
          <tr>
            <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground w-36">Saksbehandler</th>
            {kolonner.map((k) => (
              <th key={k.key} className="py-2 px-2 text-center text-xs font-semibold text-muted-foreground min-w-[90px]">
                {k.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ansatte.map((a, ri) => (
            <tr
              key={a.id}
              onClick={() => onKlikk(a.id)}
              className="cursor-pointer group"
            >
              <td className="py-1 pr-4">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors leading-tight">{a.navn}</div>
                <div className="text-xs text-muted-foreground">{a.enhet}</div>
              </td>
              {kolonner.map((k) => {
                const verdi = a[k.key];
                const bg   = celleFarge(k.tone, verdi, maks[k.key]);
                const txt  = tekstFarge(k.tone, verdi, maks[k.key]);
                return (
                  <td key={k.key} className="py-1 px-2">
                    <div
                      className="flex items-center justify-center rounded-sm h-9 font-bold tabular-nums text-sm transition-transform group-hover:scale-105"
                      style={{ background: bg, color: txt }}
                    >
                      {verdi}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">Farge-intensitet viser relativ belastning · Klikk en rad for å åpne sakslisten</p>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

export default function LederDashboard3() {
  const navigate = useNavigate();
  const [scope, setScope]     = useState<Scope>("Min avdeling");
  const [period, setPeriod]   = useState<Period>("Ingen");
  const [visning, setVisning] = useState<Visning>("klassisk");
  const [visAnsatte, setVisAnsatte] = useState(true);

  // Datovelger (egendefinert periode)
  const [fraDato, setFraDato] = useState<string>("");
  const [tilDato, setTilDato] = useState<string>("");

  const tilSaksoversikt = (params: Record<string, string>) =>
    navigate(saksoversiktUrl(params));

  // ── Filtrering ──
  const scopedCases = useMemo(() => {
    if (scope === "Min enhet") {
      const ids = EMPLOYEES.filter((e) => e.unit === "Kontroll Øst").map((e) => e.id);
      return CASES.filter((c) => c.employeeId === null || ids.includes(c.employeeId));
    }
    return CASES;
  }, [scope]);

  const cases = useMemo(() => {
    if (period === "Ingen") return scopedCases;
    if (period === "Måned hittil") return scopedCases.filter((c) => c.ageDays <= 30);
    if (period === "År hittil")    return scopedCases.filter((c) => c.ageDays <= 365);
    if (period === "Inneværende tertial") return scopedCases.filter((c) => c.ageDays <= 122);
    if (period === "Egendefinert") {
      return scopedCases.filter((c) => {
        const cDate = c.createdAt;
        if (fraDato && cDate < fraDato) return false;
        if (tilDato && cDate > tilDato) return false;
        return true;
      });
    }
    return scopedCases;
  }, [scopedCases, period, fraDato, tilDato]);

  // ── Nøkkeltall ──
  const nk = useMemo(() => {
    const åpne      = cases.filter((c) => c.status !== "Avsluttet" && c.status !== "Henlagt");
    const aktive    = cases.filter((c) => c.status === "Utredes" || c.status === "Strafferettslig vurdering");
    const avsluttet = cases.filter((c) => c.status === "Avsluttet");
    const henlagt   = cases.filter((c) => c.status === "Henlagt");
    const overFrist = åpne.filter((c) => c.ageDays > FRIST_DAGER);
    const uTildelt  = åpne.filter((c) => c.employeeId === null);
    const venterForvaltning = cases.filter((c) => c.status === "Venter på forvaltning");
    const venterPoliti      = cases.filter((c) => c.status === "Venter på politi");
    const venter = [...venterForvaltning, ...venterPoliti];

    // Snitt-ventetid for "Venter på forvaltning"
    const venterForvDager = venterForvaltning.map((c) => c.ageDays);
    const venterForvSnitt = venterForvDager.length
      ? Math.round(venterForvDager.reduce((a, b) => a + b, 0) / venterForvDager.length) : 0;

    const avsluttetDager = avsluttet.map((c) => c.ageDays);
    const snitt = avsluttetDager.length
      ? Math.round(avsluttetDager.reduce((a, b) => a + b, 0) / avsluttetDager.length) : 0;
    const median = medianAv(avsluttetDager);
    const minD   = avsluttetDager.length ? Math.min(...avsluttetDager) : 0;
    const maksD  = avsluttetDager.length ? Math.max(...avsluttetDager) : 0;

    // Henleggelsesandel av avsluttede + henlagte
    const lukket = avsluttet.length + henlagt.length;
    const henlagtPst = lukket > 0 ? Math.round((henlagt.length / lukket) * 100) : 0;

    return {
      totalt: cases.length,
      innkomne: cases.filter((c) => c.status === "Ny").length,
      aktive: aktive.length,
      avsluttet: avsluttet.length,
      henlagt: henlagt.length,
      henlagtPst,
      venter: venter.length,
      venterForvaltning: venterForvaltning.length,
      venterForvSnitt,
      overFrist: overFrist.length,
      uTildelt: uTildelt.length,
      ferdig: avsluttet.length,
      iBero: venter.length,
      beh: { snitt, median, min: minD, maks: maksD, antall: avsluttet.length },
    };
  }, [cases]);

  const statusData = useMemo(
    () => CASE_STATUSES.map((s) => ({ navn: s, antall: cases.filter((c) => c.status === s).length, farge: STATUS_FARGE[s] })),
    [cases],
  );

  const kategoriData = useMemo(
    () => CASE_CATEGORIES.map((cat, i) => ({
      navn: cat, antall: cases.filter((c) => c.category === cat).length,
      farge: KATEGORI_FARGER[i], x: i,
    })).sort((a, b) => b.antall - a.antall),
    [cases],
  );

  const ansatteData = useMemo(() => {
    const liste = scope === "Min enhet"
      ? EMPLOYEES.filter((e) => e.unit === "Kontroll Øst") : EMPLOYEES;
    return liste.map((emp) => {
      const egne      = cases.filter((c) => c.employeeId === emp.id);
      const aktive    = egne.filter((c) => ACTIVE_STATUSES.includes(c.status));
      const ferdig    = egne.filter((c) => c.status === "Avsluttet");
      const overFrist = egne.filter((c) => c.ageDays > FRIST_DAGER && c.status !== "Avsluttet");
      return { id: emp.id, navn: emp.name, enhet: emp.unit,
               tildelte: egne.length, aktive: aktive.length,
               ferdig: ferdig.length, overFrist: overFrist.length };
    }).sort((a, b) => b.overFrist - a.overFrist || b.aktive - a.aktive);
  }, [cases, scope]);

  const harAlerts = nk.overFrist > 0 || nk.uTildelt > 0;

  return (
    <div className="space-y-5">

      {/* ── Kontrollrad: scope/periode + visnings-toggle ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ScopeBar
            scope={scope} onScopeChange={setScope}
            period={period} onPeriodChange={setPeriod}
            fraDato={fraDato} tilDato={tilDato}
            onFraDatoChange={setFraDato} onTilDatoChange={setTilDato}
          />
        <div className="flex flex-col items-end gap-1 shrink-0">
          <BodyShort size="small" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Visualiseringstype
          </BodyShort>
          <ToggleGroup
            value={visning}
            onChange={(v) => { if (v) setVisning(v as Visning); }}
            variant="neutral"
            size="small"
          >
            <ToggleGroup.Item value="klassisk">
              Klassisk
            </ToggleGroup.Item>
            <ToggleGroup.Item value="alternativ">
              Alternativ
            </ToggleGroup.Item>
          </ToggleGroup>
          <BodyShort size="small" className="text-xs text-muted-foreground">
            {visning === "klassisk"
              ? "Søylediagram · Donut · Tabell"
              : "Treemap · Bubble chart · Heatmap"}
          </BodyShort>
        </div>
      </div>

      {/* ── Alerts ── */}
      {harAlerts && (
        <section aria-label="Varsler" className="space-y-2">
          {nk.overFrist > 0 && (
            <Alert variant="info" size="small">
              <strong>{nk.overFrist} saker er over {FRIST_DAGER}-dagersfristen.</strong>{" "}
              <button className="font-medium underline underline-offset-2 hover:no-underline"
                onClick={() => tilSaksoversikt({ status: "Utredes" })}>
                Se aktive saker
              </button>
            </Alert>
          )}
          {nk.uTildelt > 0 && (
            <Alert variant="warning" size="small">
              <strong>{nk.uTildelt} saker er ikke tildelt.</strong>{" "}
              <button className="font-medium underline underline-offset-2 hover:no-underline"
                onClick={() => tilSaksoversikt({ ansatt: "ikke-tildelt" })}>
                Se ikke-tildelte saker
              </button>
            </Alert>
          )}
        </section>
      )}

      {/* ── Nøkkeltall ── */}
      <section aria-labelledby="nk3-heading">
        <Heading level="2" size="xsmall" id="nk3-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Nøkkeltall
        </Heading>

        {visning === "klassisk" ? (
          /* Visning A: KPI-kort */
          <HGrid columns={{ xs: 2, sm: 3, lg: 6 }} gap="3">
            {[
              { tittel: "Totalt",        verdi: nk.totalt,     tone: "default",  ikon: <BarChartIcon aria-hidden fontSize="1.1rem" />,         param: {} },
              { tittel: "Innkomne",      verdi: nk.innkomne,   tone: "default",  ikon: <PlusIcon aria-hidden fontSize="1.1rem" />,              param: { status: "Ny" } },
              { tittel: "Aktive",        verdi: nk.aktive,     tone: "default",  ikon: <HourglassIcon aria-hidden fontSize="1.1rem" />,         param: { status: "Utredes" }, hint: "Utredes + strafferettslig" },
              { tittel: "Avsluttet",     verdi: nk.avsluttet,  tone: "suksess",  ikon: <CheckmarkCircleIcon aria-hidden fontSize="1.1rem" />,   param: { status: "Avsluttet" }, hint: nk.beh.antall > 0 ? `Snitt ${nk.beh.snitt}d · ${nk.henlagtPst}% henlagt` : undefined },
              { tittel: "Venter på forvaltning", verdi: nk.venterForvaltning, tone: "advarsel", ikon: <ClockDashedIcon aria-hidden fontSize="1.1rem" />, param: { status: "Venter på forvaltning" }, hint: nk.venterForvSnitt > 0 ? `Snitt ${nk.venterForvSnitt} dager` : "Ingen" },
              { tittel: "Ikke tildelt",  verdi: nk.uTildelt,   tone: nk.uTildelt > 0 ? "advarsel" : "suksess", ikon: <PersonCrossIcon aria-hidden fontSize="1.1rem" />, param: { ansatt: "ikke-tildelt" }, hint: "Krever tildeling" },
            ].map((k) => (
              <NkKort key={k.tittel} tittel={k.tittel} verdi={k.verdi} tone={k.tone as any}
                ikon={k.ikon} hint={k.hint} onClick={() => tilSaksoversikt(k.param)} />
            ))}
          </HGrid>
        ) : (
          /* Visning B: Stat-strip */
          <StatStrip
            onKlikk={tilSaksoversikt}
            stats={[
              { tittel: "Totalt",               verdi: nk.totalt,            tone: "default",  param: {} },
              { tittel: "Innkomne",             verdi: nk.innkomne,          tone: "default",  param: { status: "Ny" } },
              { tittel: "Aktive",               verdi: nk.aktive,            tone: "default",  param: { status: "Utredes" }, hint: "Utredes + strafferettslig" },
              { tittel: "Avsluttet",            verdi: nk.avsluttet,         tone: "suksess",  param: { status: "Avsluttet" }, hint: nk.beh.antall > 0 ? `Snitt ${nk.beh.snitt}d · ${nk.henlagtPst}% henlagt` : undefined },
              { tittel: "Venter forvaltning",   verdi: nk.venterForvaltning, tone: "advarsel", param: { status: "Venter på forvaltning" }, hint: nk.venterForvSnitt > 0 ? `Snitt ${nk.venterForvSnitt} dager` : undefined },
              { tittel: "Ikke tildelt",         verdi: nk.uTildelt,          tone: nk.uTildelt > 0 ? "advarsel" : "suksess", param: { ansatt: "ikke-tildelt" }, hint: "Krever tildeling" },
            ]}
          />
        )}
      </section>

      {/* ── Økonomi ── */}
      <Panel title="Økonomiske nøkkeltall" description="Forrige måned · Mock-tall for prototype">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { tittel: "Høyeste beløp stanset",  verdi: OKONOMISK.hoyesteBelopStanset,  farge: "text-destructive" },
            { tittel: "Totalt stanset",          verdi: OKONOMISK.totaltStanset,         farge: "text-foreground" },
            { tittel: "Innsparte beløp",         verdi: OKONOMISK.totaltInnsparing,      farge: "text-success" },
            { tittel: "Tilbakekreving",          verdi: OKONOMISK.totaltTilbakekreving,  farge: "text-foreground" },
          ].map((k) => (
            <div key={k.tittel} className="rounded-sm border border-border bg-card p-4 shadow-sm">
              <BodyShort size="small" className="font-medium text-muted-foreground leading-snug mb-2">{k.tittel}</BodyShort>
              <span className={`text-2xl font-semibold tabular-nums ${k.farge}`}>
                {k.verdi.toLocaleString("nb-NO")} kr
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Fordeling: stacked status×kategori + kakediagram ── */}
      <Panel
        title="Saksfordeling"
        description={visning === "klassisk"
          ? "Klikk et segment for å åpne filtrert saksoversikt"
          : "Treemap og bubble chart – klikk for å filtrere"}
      >
        {visning === "klassisk" ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

            {/* Venstre: stacked bar – sakstype × status */}
            <div className="xl:col-span-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sakstype fordelt på status
              </p>
              <StackedStatusKategori cases={cases} onKlikk={tilSaksoversikt} />
              {/* Status-legende */}
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {CASE_STATUSES.map((s) => (
                  <li key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: STATUS_FARGE[s] }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Høyre: kakediagram – sakstype-andeler */}
            <div className="xl:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Andel per sakstype
              </p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kategoriData} dataKey="antall" nameKey="navn"
                      isAnimationActive={false} cx="50%" cy="50%"
                      outerRadius={88} innerRadius={0} paddingAngle={1}
                      stroke="hsl(var(--card))" strokeWidth={2}
                      onClick={(entry) => tilSaksoversikt({ kategori: entry.navn })}
                      style={{ cursor: "pointer" }}
                    >
                      {kategoriData.map((d, i) => <Cell key={d.navn} fill={d.farge ?? KATEGORI_FARGER[i]} />)}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }}
                      formatter={(v: number, n: string) => [`${v} saker`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1">
                {kategoriData.map((d, i) => {
                  const total = kategoriData.reduce((s, k) => s + k.antall, 0);
                  const pct = total > 0 ? Math.round((d.antall / total) * 100) : 0;
                  return (
                    <li key={d.navn}>
                      <button onClick={() => tilSaksoversikt({ kategori: d.navn })}
                        className="flex w-full items-center justify-between gap-2 text-xs rounded-sm px-1 py-0.5 hover:bg-surface-subtle">
                        <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <span className="shrink-0 h-2 w-2 rounded-full" style={{ background: d.farge ?? KATEGORI_FARGER[i] }} />
                          <span className="truncate">{d.navn}</span>
                        </span>
                        <span className="shrink-0 tabular-nums font-semibold text-foreground">
                          {d.antall} <span className="font-normal text-muted-foreground">({pct}%)</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          /* Visning B: treemap + bubble chart side ved side */
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statusfordeling</p>
              <StatusTreemap data={statusData} onKlikk={(navn) => tilSaksoversikt({ status: navn })} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fordeling per sakstype</p>
              <KategoriBubbleChart data={kategoriData} onKlikk={(navn) => tilSaksoversikt({ kategori: navn })} />
            </div>
          </div>
        )}

        {/* Venteflaskehalser – felles begge visninger */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
          {[
            { label: "Ikke tildelt",       verdi: nk.uTildelt,               tone: "feil",     params: { ansatt: "ikke-tildelt" } },
            { label: "Venter forvaltning", verdi: nk.venterForvaltning,       tone: "advarsel", params: { status: "Venter på forvaltning" } },
            { label: "Venter politi",      verdi: cases.filter((c) => c.status === "Venter på politi").length, tone: "default", params: { status: "Venter på politi" } },
          ].map((f) => (
            <button key={f.label} onClick={() => tilSaksoversikt(f.params)}
              className="text-center rounded-sm p-2 hover:bg-surface-subtle transition-colors cursor-pointer">
              <div className={cn("text-xl font-bold tabular-nums",
                f.tone === "feil" ? "text-destructive" : f.tone === "advarsel" ? "text-warning-foreground" : "text-foreground"
              )}>{f.verdi}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f.label}</div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel
        title="Kapasitetsoversikt"
        description={visning === "klassisk"
          ? "Klikk en rad for å åpne sakslisten til saksbehandleren"
          : "Heatmap – farge-intensitet viser relativ belastning · Klikk for å filtrere"}
        actions={
          <HStack gap="3" align="center">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <PersonGroupIcon className="h-3.5 w-3.5" aria-hidden />
              {ansatteData.length} ansatte
            </span>
            <button onClick={() => setVisAnsatte((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              {visAnsatte ? <ChevronUpIcon className="h-4 w-4" aria-hidden /> : <ChevronDownIcon className="h-4 w-4" aria-hidden />}
              {visAnsatte ? "Skjul" : "Vis"}
            </button>
          </HStack>
        }
        contentClassName={visAnsatte ? "p-0" : "p-0 hidden"}
      >
        {visning === "klassisk" ? (
          /* Visning A: Tabell med workload-meter */
          <Table size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Saksbehandler</Table.HeaderCell>
                <Table.HeaderCell>
                  <HStack gap="1" align="center">
                    Kapasitet <span className="text-xs font-normal text-muted-foreground">(aktive/{KAPASITET_MAKS})</span>
                  </HStack>
                </Table.HeaderCell>
                <Table.HeaderCell align="right">Tildelte</Table.HeaderCell>
                <Table.HeaderCell align="right">Aktive</Table.HeaderCell>
                <Table.HeaderCell align="right">Fullførte</Table.HeaderCell>
                <Table.HeaderCell align="right">Over frist</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ansatteData.map((emp) => (
                <Table.Row key={emp.id} onClick={() => tilSaksoversikt({ ansatt: emp.id })}
                  className="cursor-pointer hover:bg-surface-subtle">
                  <Table.DataCell>
                    <div className="font-medium">{emp.navn}</div>
                    <div className="text-xs text-muted-foreground">{emp.enhet}</div>
                  </Table.DataCell>
                  <Table.DataCell>
                    <WorkloadMeter aktive={emp.aktive} overFrist={emp.overFrist} />
                  </Table.DataCell>
                  <Table.DataCell align="right">{emp.tildelte}</Table.DataCell>
                  <Table.DataCell align="right">{emp.aktive}</Table.DataCell>
                  <Table.DataCell align="right">{emp.ferdig}</Table.DataCell>
                  <Table.DataCell align="right">
                    <span className={cn("font-semibold tabular-nums",
                      emp.overFrist > 0 ? "text-destructive" : "text-muted-foreground")}>
                      {emp.overFrist}
                    </span>
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          /* Visning B: Heatmap-grid */
          <div className="p-5">
            <KapasitetHeatmap ansatte={ansatteData} onKlikk={(id) => tilSaksoversikt({ ansatt: id })} />
          </div>
        )}
      </Panel>

    </div>
  );
}
