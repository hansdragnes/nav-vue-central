/**
 * LederDashboard2 — redesignet lederdashboard
 *
 * UX-prinsipper:
 * - Scannability: kritiske avvik synlig øverst som alerts, ikke gjemt i tall
 * - Hierarki: nøkkeltall → statusflyt → kapasitet → kategorifordeling → drilldown
 * - Handlingsbarhet: hvert panel gir kontekst for hva lederen bør gjøre
 * - Progressiv disclosure: drilldown-tabeller vises inline ved klikk
 * - Visuell koding: rødt = krev handling, gult = advarsel, grønt = OK
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChartIcon,
  CheckmarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockDashedIcon,
  ExclamationmarkTriangleIcon,
  HourglassIcon,
  PersonCrossIcon,
  PersonGroupIcon,
  Buildings2Icon,
  ShieldIcon,
  XMarkOctagonIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Heading,
  HGrid,
  HStack,
  Table,
  Tag,
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
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScopeBar, type Period, type Scope } from "@/components/aksel/ScopeBar";
import { Panel } from "@/components/aksel/Panel";
import { CaseTable } from "@/components/CaseTable";
import { cn } from "@/lib/utils";
import {
  ACTIVE_STATUSES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  CASES,
  EMPLOYEES,
  type CaseRow,
  type CaseStatus,
} from "@/data/cases";

// ─── Konstanter ───────────────────────────────────────────────────────────────

const FRIST_DAGER = 30;
const KAPASITET_MAKS = 20; // referansepunkt for workload-meter

const STATUS_FARGE: Record<CaseStatus, string> = {
  "Ny":                    "hsl(211 100% 39%)",
  "Under behandling":      "hsl(211 100% 60%)",
  "Venter på bruker":      "hsl(35 100% 47%)",
  "Venter på forvaltning": "hsl(28 90% 55%)",
  "Venter på politi":      "hsl(280 50% 55%)",
  "Henlagt":               "hsl(213 67% 30%)",
  "Ferdig":                "hsl(145 63% 28%)",
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

// ─── Hjelpere ─────────────────────────────────────────────────────────────────

function formatDato(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function medianAv(tall: number[]): number {
  if (!tall.length) return 0;
  const sortert = [...tall].sort((a, b) => a - b);
  const midt = Math.floor(sortert.length / 2);
  return sortert.length % 2 !== 0
    ? sortert[midt]
    : Math.round((sortert[midt - 1] + sortert[midt]) / 2);
}

// ─── Subkomponenter ───────────────────────────────────────────────────────────

/** Nøkkeltallkort – watson-sak Nokkeltallkort-mønster med tone-støtte */
interface NkProps {
  tittel: string;
  verdi: number | string;
  enhet?: string;
  ikon: React.ReactNode;
  tone?: "default" | "advarsel" | "feil" | "suksess";
  hint?: string;
}

const NK_IKON_KLS: Record<string, string> = {
  default:  "bg-secondary text-primary",
  advarsel: "bg-warning-surface/60 text-warning-foreground",
  feil:     "bg-destructive-surface text-destructive",
  suksess:  "bg-success-surface/60 text-success",
};

function Nk({ tittel, verdi, enhet, ikon, tone = "default", hint }: NkProps) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <BodyShort size="small" className="font-medium text-muted-foreground leading-snug">
          {tittel}
        </BodyShort>
        <div className={cn("shrink-0 rounded-md p-1.5", NK_IKON_KLS[tone])}>
          {ikon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tabular-nums text-foreground">{verdi}</span>
          {enhet && (
            <span className="text-sm text-muted-foreground">{enhet}</span>
          )}
        </div>
        {hint && (
          <BodyShort size="small" className="mt-0.5 text-muted-foreground">
            {hint}
          </BodyShort>
        )}
      </div>
    </div>
  );
}

/** Horisontalt søylediagram – Recharts-versjon (watson-sak-mønster) */
interface RechartsSoyleProps {
  data: { navn: string; antall: number; farge?: string }[];
  ariaLabel: string;
  onClick?: (navn: string) => void;
  valgt?: string | null;
}

function RechartsSoylediagram({ data, ariaLabel, onClick, valgt }: RechartsSoyleProps) {
  const høyde = Math.max(180, data.length * 44 + 40);
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={høyde}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 0, right: 48, top: 4, bottom: 4 }}
          onClick={(e) => {
            if (onClick && e?.activeLabel) onClick(e.activeLabel);
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            stroke="hsl(var(--border))"
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="navn"
            width={148}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            stroke="hsl(var(--border))"
          />
          <RechartsTooltip
            cursor={{ fill: "hsl(var(--surface-subtle))" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 4,
              fontSize: 12,
            }}
            formatter={(v: number, n: string) => [`${v} saker`, n]}
          />
          <Bar
            dataKey="antall"
            radius={[0, 3, 3, 0]}
            barSize={22}
            cursor={onClick ? "pointer" : undefined}
          >
            {data.map((d, i) => (
              <Cell
                key={d.navn}
                fill={d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length]}
                opacity={valgt && valgt !== d.navn ? 0.35 : 1}
              />
            ))}
            <LabelList
              dataKey="antall"
              position="right"
              style={{ fontSize: 12, fontWeight: 600, fill: "hsl(var(--foreground))" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Workload-meter: visuell søyle som viser kapasitetsutnyttelse per ansatt */
interface WorkloadMeterProps {
  aktive: number;
  maks?: number;
  overFrist: number;
}

function WorkloadMeter({ aktive, maks = KAPASITET_MAKS, overFrist }: WorkloadMeterProps) {
  const pct = Math.min(100, Math.round((aktive / maks) * 100));
  const farge =
    pct >= 90 ? "bg-destructive" :
    pct >= 70 ? "bg-warning" :
    "bg-success";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-none", farge)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right shrink-0">{aktive}</span>
      {overFrist > 0 && (
        <span className="text-xs font-semibold text-destructive tabular-nums shrink-0">
          +{overFrist}f
        </span>
      )}
    </div>
  );
}

/** Behandlingstid-spenn – mini-visualisering inspirert av BehandlingstidVisning */
interface SpennProps {
  min: number;
  median: number;
  gjennomsnitt: number;
  maks: number;
}

function BehandlingstidSpenn({ min, median, gjennomsnitt, maks }: SpennProps) {
  const range = maks - min || 1;
  const medianPct = ((median - min) / range) * 100;
  const snittPct  = ((gjennomsnitt - min) / range) * 100;
  return (
    <div
      role="img"
      aria-label={`Behandlingstid min ${min} – maks ${maks} dager. Median ${median} d. Snitt ${gjennomsnitt} d.`}
    >
      <HStack gap="2" align="center" className="mb-3">
        <BodyShort size="small" className="text-muted-foreground whitespace-nowrap w-8 text-right">{min}d</BodyShort>
        <div className="relative flex-1 h-3 rounded-full bg-surface-muted overflow-visible">
          <div className="absolute inset-0 rounded-full bg-secondary" />
          {/* Median */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded bg-primary"
            style={{ left: `${medianPct}%` }}
            title={`Median: ${median} dager`}
          />
          {/* Gjennomsnitt */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded bg-warning"
            style={{ left: `${snittPct}%` }}
            title={`Snitt: ${gjennomsnitt} dager`}
          />
        </div>
        <BodyShort size="small" className="text-muted-foreground whitespace-nowrap w-8">{maks}d</BodyShort>
      </HStack>
      <HStack gap="4" justify="center">
        <HStack gap="1" align="center">
          <span className="inline-block h-0.5 w-3 rounded bg-primary" />
          <BodyShort size="small" className="text-muted-foreground">Median ({median}d)</BodyShort>
        </HStack>
        <HStack gap="1" align="center">
          <span className="inline-block h-0.5 w-3 rounded bg-warning" />
          <BodyShort size="small" className="text-muted-foreground">Snitt ({gjennomsnitt}d)</BodyShort>
        </HStack>
      </HStack>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

type DrilldownKilde = { type: "status"; verdi: CaseStatus } | { type: "ansatt"; id: string; navn: string } | null;

export default function LederDashboard2() {
  const navigate = useNavigate();
  const [scope, setScope]   = useState<Scope>("Min avdeling");
  const [period, setPeriod] = useState<Period>("Ingen");
  const [drilldown, setDrilldown] = useState<DrilldownKilde>(null);
  const [visAnsatte, setVisAnsatte] = useState(true);

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
    const cutoff = period === "Måned hittil" ? 25 : period === "Inneværende tertial" ? 90 : 200;
    return scopedCases.filter((c) => c.ageDays <= cutoff);
  }, [scopedCases, period]);

  // ── Nøkkeltall ──
  const nk = useMemo(() => {
    const åpne      = cases.filter((c) => c.status !== "Ferdig" && c.status !== "Henlagt");
    const aktive    = cases.filter((c) => ACTIVE_STATUSES.includes(c.status));
    const ferdig    = cases.filter((c) => c.status === "Ferdig");
    const overFrist = åpne.filter((c) => c.ageDays > FRIST_DAGER);
    const uTildelt  = åpne.filter((c) => c.employeeId === null);
    const iBero     = cases.filter(
      (c) => c.status === "Venter på bruker" || c.status === "Venter på forvaltning" || c.status === "Venter på politi",
    );
    const eldst = åpne.reduce<CaseRow | null>(
      (p, c) => (!p || c.ageDays > p.ageDays ? c : p), null,
    );
    // Behandlingstid basert på ferdigstilte saker
    const ferdigeDager = ferdig.map((c) => c.ageDays);
    const snittBeh = ferdigeDager.length
      ? Math.round(ferdigeDager.reduce((a, b) => a + b, 0) / ferdigeDager.length)
      : 0;
    const medianBeh = medianAv(ferdigeDager);
    const minBeh    = ferdigeDager.length ? Math.min(...ferdigeDager) : 0;
    const maksBeh   = ferdigeDager.length ? Math.max(...ferdigeDager) : 0;

    return {
      totalt: cases.length,
      aktive: aktive.length,
      ferdig: ferdig.length,
      overFrist: overFrist.length,
      uTildelt: uTildelt.length,
      iBero: iBero.length,
      eldst,
      beh: { snitt: snittBeh, median: medianBeh, min: minBeh, maks: maksBeh, antall: ferdig.length },
    };
  }, [cases]);

  // ── Statusdata ──
  const statusData = useMemo(
    () => CASE_STATUSES.map((s) => ({
      navn: s,
      antall: cases.filter((c) => c.status === s).length,
      farge: STATUS_FARGE[s],
    })),
    [cases],
  );

  // ── Kategoridata ──
  const kategoriData = useMemo(
    () => CASE_CATEGORIES.map((cat, i) => ({
      navn: cat,
      antall: cases.filter((c) => c.category === cat).length,
      farge: KATEGORI_FARGER[i],
    })).sort((a, b) => b.antall - a.antall),
    [cases],
  );

  // ── Ansattedata ──
  const ansatteData = useMemo(() => {
    const liste = scope === "Min enhet"
      ? EMPLOYEES.filter((e) => e.unit === "Kontroll Øst")
      : EMPLOYEES;
    return liste.map((emp) => {
      const egne     = cases.filter((c) => c.employeeId === emp.id);
      const aktive   = egne.filter((c) => ACTIVE_STATUSES.includes(c.status));
      const ferdig   = egne.filter((c) => c.status === "Ferdig");
      const overFrist = egne.filter((c) => c.ageDays > FRIST_DAGER && c.status !== "Ferdig");
      const nyeste   = egne.reduce<CaseRow | null>(
        (p, c) => (!p || c.ageDays < p.ageDays ? c : p), null,
      );
      return {
        id: emp.id,
        navn: emp.name,
        enhet: emp.unit,
        tildelte: egne.length,
        aktive: aktive.length,
        ferdig: ferdig.length,
        overFrist: overFrist.length,
        nyeste,
      };
    }).sort((a, b) => b.overFrist - a.overFrist || b.aktive - a.aktive);
  }, [cases, scope]);

  // ── Drilldown-saker ──
  const drilldownSaker = useMemo<CaseRow[]>(() => {
    if (!drilldown) return [];
    if (drilldown.type === "status") return cases.filter((c) => c.status === drilldown.verdi);
    return cases.filter((c) => c.employeeId === drilldown.id);
  }, [cases, drilldown]);

  const toggleStatus = (navn: string) => {
    const s = navn as CaseStatus;
    setDrilldown((prev) =>
      prev?.type === "status" && prev.verdi === s ? null : { type: "status", verdi: s },
    );
  };

  const toggleAnsatt = (id: string, navn: string) => {
    setDrilldown((prev) =>
      prev?.type === "ansatt" && prev.id === id ? null : { type: "ansatt", id, navn },
    );
  };

  // ── Alerts – kun synlig om det er noe å si fra om ──
  const harAlerts = nk.overFrist > 0 || nk.uTildelt > 0;

  return (
    <div className="space-y-5">
      <ScopeBar scope={scope} onScopeChange={setScope} period={period} onPeriodChange={setPeriod} />

      {/* ── 1. Alerts – kritiske avvik øverst ── */}
      {harAlerts && (
        <section aria-label="Varsler som krever oppmerksomhet" className="space-y-2">
          {nk.overFrist > 0 && (
            <Alert variant="error" size="small">
              <strong>{nk.overFrist} saker er over {FRIST_DAGER}-dagersfristen</strong> — disse bør behandles snarest.
              {" "}
              <button
                className="font-medium underline underline-offset-2 hover:no-underline"
                onClick={() => setDrilldown({ type: "status", verdi: "Under behandling" })}
              >
                Se aktive saker
              </button>
            </Alert>
          )}
          {nk.uTildelt > 0 && (
            <Alert variant="warning" size="small">
              <strong>{nk.uTildelt} saker er ikke tildelt</strong> — fordel disse til saksbehandlere.
            </Alert>
          )}
        </section>
      )}

      {/* ── 2. Nøkkeltall ── */}
      <section aria-labelledby="nk-heading">
        <Heading
          level="2"
          size="xsmall"
          id="nk-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Nøkkeltall
        </Heading>
        <HGrid columns={{ xs: 2, sm: 3, lg: 5 }} gap="3">
          <Nk
            tittel="Totalt antall saker"
            verdi={nk.totalt}
            ikon={<BarChartIcon aria-hidden fontSize="1.1rem" />}
          />
          <Nk
            tittel="Aktive saker"
            verdi={nk.aktive}
            ikon={<HourglassIcon aria-hidden fontSize="1.1rem" />}
            hint={`${Math.round((nk.aktive / Math.max(nk.totalt, 1)) * 100)}% av portefølje`}
          />
          <Nk
            tittel="Ferdigstilte"
            verdi={nk.ferdig}
            tone="suksess"
            ikon={<CheckmarkCircleIcon aria-hidden fontSize="1.1rem" />}
            hint={nk.beh.antall > 0 ? `Snitt ${nk.beh.snitt} dager` : undefined}
          />
          <Nk
            tittel="Over frist"
            verdi={nk.overFrist}
            tone={nk.overFrist > 0 ? "feil" : "suksess"}
            ikon={<XMarkOctagonIcon aria-hidden fontSize="1.1rem" />}
            hint={`>${FRIST_DAGER} dager åpen`}
          />
          <Nk
            tittel="Ikke tildelt"
            verdi={nk.uTildelt}
            tone={nk.uTildelt > 0 ? "advarsel" : "suksess"}
            ikon={<PersonCrossIcon aria-hidden fontSize="1.1rem" />}
            hint="Krever tildeling"
          />
        </HGrid>
      </section>

      {/* ── 3. Statusflyt + behandlingstid ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Statusflyt */}
        <Panel
          title="Statusfordeling"
          description="Klikk en rad for å se saksliste"
          className="xl:col-span-3"
        >
          <RechartsSoylediagram
            data={statusData}
            ariaLabel={`Horisontalt søylediagram: ${statusData.map((s) => `${s.navn} ${s.antall}`).join(", ")}`}
            onClick={toggleStatus}
            valgt={drilldown?.type === "status" ? drilldown.verdi : null}
          />
          {/* Venteflaskehalser kompakt under diagrammet */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
            {[
              { label: "Ikke tildelt", verdi: nk.uTildelt, tone: "feil" as const },
              { label: "Venter forvaltning", verdi: cases.filter((c) => c.status === "Venter på forvaltning").length, tone: "advarsel" as const },
              { label: "Venter politi", verdi: cases.filter((c) => c.status === "Venter på politi").length, tone: "default" as const },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className={cn(
                  "text-xl font-bold tabular-nums",
                  f.tone === "feil" ? "text-destructive" :
                  f.tone === "advarsel" ? "text-warning-foreground" :
                  "text-foreground"
                )}>{f.verdi}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.label}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Behandlingstid + eldste sak */}
        <Panel
          title="Behandlingstid"
          description={`Basert på ${nk.beh.antall} ferdigstilte saker`}
          className="xl:col-span-2"
        >
          <VStack gap="6">
            {nk.beh.antall > 0 ? (
              <>
                <BehandlingstidSpenn
                  min={nk.beh.min}
                  median={nk.beh.median}
                  gjennomsnitt={nk.beh.snitt}
                  maks={nk.beh.maks}
                />
                <HGrid columns={2} gap="3">
                  {[
                    { tittel: "Minimum", verdi: nk.beh.min },
                    { tittel: "Median", verdi: nk.beh.median },
                    { tittel: "Gjennomsnitt", verdi: nk.beh.snitt },
                    { tittel: "Maksimum", verdi: nk.beh.maks },
                  ].map((m) => (
                    <div key={m.tittel} className="rounded-sm border border-border bg-surface-subtle p-3">
                      <BodyShort size="small" className="text-muted-foreground">{m.tittel}</BodyShort>
                      <div className="text-xl font-semibold tabular-nums">{m.verdi}<span className="text-sm font-normal text-muted-foreground ml-1">d</span></div>
                    </div>
                  ))}
                </HGrid>
              </>
            ) : (
              <BodyShort className="text-muted-foreground">Ingen ferdigstilte saker i valgt periode.</BodyShort>
            )}

            {/* Eldste åpne sak */}
            {nk.eldst && (
              <div className="rounded-sm border border-destructive/30 bg-destructive-surface/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ExclamationmarkTriangleIcon className="h-4 w-4 text-destructive shrink-0" aria-hidden />
                  <BodyShort size="small" className="font-semibold text-destructive">Eldste åpne sak</BodyShort>
                </div>
                <p className="text-sm font-semibold text-foreground">{nk.eldst.id}</p>
                <p className="text-xs text-muted-foreground">
                  Opprettet {formatDato(nk.eldst.createdAt)} · {nk.eldst.ageDays} dager gammel
                </p>
              </div>
            )}
          </VStack>
        </Panel>
      </div>

      {/* ── 4. Kapasitetsoversikt (ansatttabell med workload-meter) ── */}
      <Panel
        title="Kapasitetsoversikt"
        description="Aktive saker og fristbrudd per saksbehandler"
        actions={
          <HStack gap="3" align="center">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <PersonGroupIcon className="h-3.5 w-3.5" aria-hidden />
              {ansatteData.length} ansatte
            </span>
            <button
              onClick={() => setVisAnsatte((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              aria-expanded={visAnsatte}
            >
              {visAnsatte ? <ChevronUpIcon className="h-4 w-4" aria-hidden /> : <ChevronDownIcon className="h-4 w-4" aria-hidden />}
              {visAnsatte ? "Skjul" : "Vis"}
            </button>
          </HStack>
        }
        contentClassName={visAnsatte ? "p-0" : "p-0 hidden"}
      >
        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Saksbehandler</Table.HeaderCell>
              <Table.HeaderCell>
                <HStack gap="1" align="center">
                  Kapasitet
                  <span className="text-xs font-normal text-muted-foreground">(aktive / {KAPASITET_MAKS})</span>
                </HStack>
              </Table.HeaderCell>
              <Table.HeaderCell align="right">Tildelte</Table.HeaderCell>
              <Table.HeaderCell align="right">Aktive</Table.HeaderCell>
              <Table.HeaderCell align="right">Fullførte</Table.HeaderCell>
              <Table.HeaderCell align="right">Over frist</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ansatteData.map((emp) => {
              const erValgt = drilldown?.type === "ansatt" && drilldown.id === emp.id;
              return (
                <Table.Row
                  key={emp.id}
                  onClick={() => toggleAnsatt(emp.id, emp.navn)}
                  className={cn(
                    "cursor-pointer",
                    erValgt && "bg-secondary",
                  )}
                >
                  <Table.DataCell>
                    <div className="font-medium text-foreground">{emp.navn}</div>
                    <div className="text-xs text-muted-foreground">{emp.enhet}</div>
                  </Table.DataCell>
                  <Table.DataCell>
                    <WorkloadMeter
                      aktive={emp.aktive}
                      maks={KAPASITET_MAKS}
                      overFrist={emp.overFrist}
                    />
                  </Table.DataCell>
                  <Table.DataCell align="right">{emp.tildelte}</Table.DataCell>
                  <Table.DataCell align="right">{emp.aktive}</Table.DataCell>
                  <Table.DataCell align="right">{emp.ferdig}</Table.DataCell>
                  <Table.DataCell align="right">
                    <span className={cn(
                      "font-semibold tabular-nums",
                      emp.overFrist > 0 ? "text-destructive" : "text-muted-foreground",
                    )}>
                      {emp.overFrist}
                    </span>
                  </Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Panel>

      {/* ── 5. Kategorifordeling ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Panel
          title="Fordeling per sakstype"
          description="Sortert etter volum"
          className="xl:col-span-3"
        >
          <RechartsSoylediagram
            data={kategoriData}
            ariaLabel={`Saker per kategori: ${kategoriData.map((k) => `${k.navn} ${k.antall}`).join(", ")}`}
          />
        </Panel>

        <Panel title="Porteføljefordeling" description="Kakediagram per sakstype" className="xl:col-span-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kategoriData}
                  dataKey="antall"
                  nameKey="navn"
                  isAnimationActive={false}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={32}
                  paddingAngle={2}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                >
                  {kategoriData.map((d, i) => (
                    <Cell key={d.navn} fill={d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n: string) => [`${v} saker`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {kategoriData.map((d, i) => {
              const total = kategoriData.reduce((s, k) => s + k.antall, 0);
              const pct   = total > 0 ? Math.round((d.antall / total) * 100) : 0;
              return (
                <li key={d.navn} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                    <span
                      className="shrink-0 h-2 w-2 rounded-full"
                      style={{ background: d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length] }}
                    />
                    <span className="truncate">{d.navn}</span>
                  </span>
                  <span className="shrink-0 tabular-nums font-semibold text-foreground">
                    {d.antall} <span className="font-normal text-muted-foreground">({pct}%)</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── 6. Drilldown – inline, vises ved klikk ── */}
      {drilldown && (
        <Panel
          title={
            drilldown.type === "status"
              ? `Saker med status: ${drilldown.verdi}`
              : `Saker tildelt: ${drilldown.navn}`
          }
          description={`${drilldownSaker.length} saker`}
          contentClassName="p-0"
          actions={
            <HStack gap="3" align="center">
              {drilldown.type === "ansatt" && (
                <button
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => navigate(`/saksoversikt?ansatt=${drilldown.id}`)}
                >
                  Åpne saksoversikt
                </button>
              )}
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setDrilldown(null)}
              >
                Lukk ✕
              </button>
            </HStack>
          }
        >
          {drilldownSaker.length > 0 ? (
            <CaseTable rows={drilldownSaker} maxHeight="380px" />
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              Ingen saker
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
