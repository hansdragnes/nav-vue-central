import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChartIcon,
  CheckmarkCircleIcon,
  ClockDashedIcon,
  HourglassIcon,
  PersonCrossIcon,
  PersonGroupIcon,
  Buildings2Icon,
  ShieldIcon,
  XMarkOctagonIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Box,
  Heading,
  HGrid,
  HStack,
  Table,
  VStack,
} from "@navikt/ds-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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

// ─── Farger ──────────────────────────────────────────────────────────────────

const STATUS_FARGE: Record<CaseStatus, string> = {
  "Ny": "hsl(211 100% 39%)",
  "Under behandling": "hsl(211 100% 60%)",
  "Venter på bruker": "hsl(35 100% 47%)",
  "Venter på forvaltning": "hsl(28 90% 55%)",
  "Venter på politi": "hsl(280 50% 55%)",
  "Henlagt": "hsl(213 67% 30%)",
  "Ferdig": "hsl(145 63% 28%)",
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

const FRIST_DAGER = 30;

// ─── Hjelpere ─────────────────────────────────────────────────────────────────

function formatDato(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

// ─── Nokkeltallkort (watson-sak-mønster) ────────────────────────────────────

interface NokkeltallkortProps {
  tittel: string;
  verdi: number | string;
  enhet?: string;
  ikon?: React.ReactNode;
  tone?: "default" | "advarsel" | "feil" | "suksess";
  hint?: string;
}

const TONE_IKON_KLASSE: Record<string, string> = {
  default: "bg-secondary text-primary",
  advarsel: "bg-warning-surface/60 text-warning-foreground",
  feil: "bg-destructive-surface text-destructive",
  suksess: "bg-success-surface/60 text-success",
};

function Nokkeltallkort({ tittel, verdi, enhet, ikon, tone = "default", hint }: NokkeltallkortProps) {
  const ikonKlasse = TONE_IKON_KLASSE[tone];
  return (
    <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
      <HStack gap="4" align="center">
        {ikon && (
          <div className={cn("flex items-center justify-center rounded-md p-2", ikonKlasse)}>
            {ikon}
          </div>
        )}
        <VStack>
          <BodyShort size="small" className="text-muted-foreground font-medium">
            {tittel}
          </BodyShort>
          <HStack gap="1" align="baseline">
            <span className="text-3xl font-semibold tabular-nums text-foreground">{verdi}</span>
            {enhet && (
              <BodyShort size="small" className="text-muted-foreground" as="span">
                {enhet}
              </BodyShort>
            )}
          </HStack>
          {hint && (
            <BodyShort size="small" className="text-muted-foreground mt-0.5">
              {hint}
            </BodyShort>
          )}
        </VStack>
      </HStack>
    </div>
  );
}

// ─── Horisontalt søylediagram ────────────────────────────────────────────────

interface SoylediagramProps {
  data: { navn: string; antall: number; farge?: string }[];
  ariaLabel?: string;
}

function HorisontaltSoylediagram({ data, ariaLabel }: SoylediagramProps) {
  const max = Math.max(...data.map((d) => d.antall), 1);
  return (
    <div aria-label={ariaLabel} className="space-y-2">
      {data.map((d, i) => {
        const pct = Math.round((d.antall / max) * 100);
        const farge = d.farge ?? KATEGORI_FARGER[i % KATEGORI_FARGER.length];
        return (
          <div key={d.navn} className="flex items-center gap-3">
            <span className="w-36 shrink-0 truncate text-sm text-muted-foreground text-right">
              {d.navn}
            </span>
            <div className="flex-1 bg-surface-muted rounded-sm h-6 overflow-hidden">
              <div
                className="h-full rounded-sm transition-none"
                style={{ width: `${pct}%`, background: farge }}
              />
            </div>
            <span className="w-8 shrink-0 text-sm font-semibold tabular-nums text-foreground text-right">
              {d.antall}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── WaitTile ────────────────────────────────────────────────────────────────

interface WaitTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "error" | "warning" | "alt";
}

const toneKlasser: Record<WaitTileProps["tone"], string> = {
  error: "border-l-destructive bg-destructive-surface/40 text-destructive",
  warning: "border-l-warning bg-warning-surface/40 text-warning-foreground",
  alt: "border-l-alt bg-alt-surface text-alt",
};

function WaitTile({ icon: Icon, label, value, tone }: WaitTileProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-sm border border-border border-l-4 p-3",
        toneKlasser[tone],
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

const LederDashboard = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope>("Min avdeling");
  const [period, setPeriod] = useState<Period>("Ingen");
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | null>(null);

  const scopedCases = useMemo(() => {
    if (scope === "Min enhet") {
      const unitEmployees = EMPLOYEES.filter((e) => e.unit === "Kontroll Øst").map((e) => e.id);
      return CASES.filter((c) => c.employeeId === null || unitEmployees.includes(c.employeeId));
    }
    return CASES;
  }, [scope]);

  const periodCases = useMemo(() => {
    if (period === "Ingen") return scopedCases;
    const cutoff = period === "Måned hittil" ? 25 : period === "Inneværende tertial" ? 90 : 200;
    return scopedCases.filter((c) => c.ageDays <= cutoff);
  }, [scopedCases, period]);

  // Nøkkeltall
  const nokkeltall = useMemo(() => {
    const aktive = periodCases.filter((c) => ACTIVE_STATUSES.includes(c.status));
    const underBehandling = periodCases.filter((c) => c.status === "Under behandling");
    const ferdig = periodCases.filter((c) => c.status === "Ferdig");
    const overFrist = periodCases.filter((c) => c.ageDays > FRIST_DAGER && c.status !== "Ferdig");
    const eldst = periodCases.reduce<CaseRow | null>(
      (prev, c) => (c.status !== "Ferdig" && (!prev || c.ageDays > prev.ageDays) ? c : prev),
      null,
    );
    const iBero = periodCases.filter(
      (c) => c.status === "Venter på bruker" || c.status === "Venter på forvaltning" || c.status === "Venter på politi",
    );
    return {
      totalt: periodCases.length,
      aktive: aktive.length,
      underBehandling: underBehandling.length,
      ferdig: ferdig.length,
      overFrist: overFrist.length,
      iBero: iBero.length,
      eldst,
    };
  }, [periodCases]);

  const categoryData = useMemo(
    () =>
      CASE_CATEGORIES.map((cat) => ({
        category: cat,
        count: periodCases.filter((c) => c.category === cat).length,
      })),
    [periodCases],
  );

  const statusData = useMemo(
    () =>
      CASE_STATUSES.map((s) => ({
        status: s,
        count: periodCases.filter((c) => c.status === s).length,
      })),
    [periodCases],
  );

  const waiting = useMemo(() => ({
    unassigned: periodCases.filter((c) => c.employeeId === null && c.status !== "Ferdig").length,
    admin: periodCases.filter((c) => c.status === "Venter på forvaltning").length,
    politi: periodCases.filter((c) => c.status === "Venter på politi").length,
  }), [periodCases]);

  const employeeRows = useMemo(() => {
    const ansatte = scope === "Min enhet"
      ? EMPLOYEES.filter((e) => e.unit === "Kontroll Øst")
      : EMPLOYEES;
    return ansatte.map((emp) => {
      const own = periodCases.filter((c) => c.employeeId === emp.id);
      return {
        id: emp.id,
        name: emp.name,
        assigned: own.length,
        active: own.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
        completed: own.filter((c) => c.status === "Ferdig").length,
        overFrist: own.filter((c) => c.ageDays > FRIST_DAGER && c.status !== "Ferdig").length,
      };
    });
  }, [periodCases, scope]);

  const filteredCases: CaseRow[] = useMemo(() => {
    if (!selectedStatus) return [];
    return periodCases.filter((c) => c.status === selectedStatus);
  }, [periodCases, selectedStatus]);

  return (
    <div>
      <ScopeBar
        scope={scope}
        onScopeChange={setScope}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* ── Nøkkeltall (watson-sak Nokkeltallkort-mønster) ── */}
      <section aria-labelledby="nokkeltall-heading" className="mb-6">
        <Heading level="2" size="small" spacing id="nokkeltall-heading" className="text-muted-foreground uppercase tracking-wide text-xs font-semibold">
          Nøkkeltall
        </Heading>
        <HGrid columns={{ xs: 2, sm: 3, lg: 6 }} gap="4">
          <Nokkeltallkort
            tittel="Totalt"
            verdi={nokkeltall.totalt}
            ikon={<BarChartIcon aria-hidden fontSize="1.25rem" />}
          />
          <Nokkeltallkort
            tittel="Aktive saker"
            verdi={nokkeltall.aktive}
            ikon={<HourglassIcon aria-hidden fontSize="1.25rem" />}
          />
          <Nokkeltallkort
            tittel="Under behandling"
            verdi={nokkeltall.underBehandling}
            ikon={<HourglassIcon aria-hidden fontSize="1.25rem" />}
          />
          <Nokkeltallkort
            tittel="Ferdigstilte"
            verdi={nokkeltall.ferdig}
            tone="suksess"
            ikon={<CheckmarkCircleIcon aria-hidden fontSize="1.25rem" />}
          />
          <Nokkeltallkort
            tittel="Over frist"
            verdi={nokkeltall.overFrist}
            tone={nokkeltall.overFrist > 0 ? "feil" : "suksess"}
            hint={`>${FRIST_DAGER} dager`}
            ikon={<XMarkOctagonIcon aria-hidden fontSize="1.25rem" />}
          />
          <Nokkeltallkort
            tittel="I bero"
            verdi={nokkeltall.iBero}
            tone={nokkeltall.iBero > 5 ? "advarsel" : "default"}
            ikon={<ClockDashedIcon aria-hidden fontSize="1.25rem" />}
          />
        </HGrid>
      </section>

      {/* ── Hovedinnhold: to kolonner ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 mb-5">

        {/* Saker per status – horisontalt søylediagram (watson-sak-stil) */}
        <Panel
          title="Saker per status"
          description="Fordeling av saksmengden"
          className="xl:col-span-2"
        >
          <VStack gap="6">
            <HorisontaltSoylediagram
              data={statusData.map((s) => ({
                navn: s.status,
                antall: s.count,
                farge: STATUS_FARGE[s.status],
              }))}
              ariaLabel={`Søylediagram over saker per status. ${statusData.map((s) => `${s.status}: ${s.count}`).join(", ")}`}
            />
            {/* Klikkbar statusliste under diagrammet */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Klikk en status for å se sakslisten
              </p>
              <div className="flex flex-wrap gap-2">
                {statusData.map((s) => (
                  <button
                    key={s.status}
                    onClick={() => setSelectedStatus(selectedStatus === s.status ? null : s.status)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold transition-colors",
                      selectedStatus === s.status
                        ? "border-primary bg-secondary text-primary"
                        : "border-border bg-card text-foreground hover:bg-surface-subtle",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: STATUS_FARGE[s.status] }}
                    />
                    {s.status}
                    <span className="ml-1 tabular-nums text-muted-foreground">{s.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </VStack>
        </Panel>

        {/* Venteoversikt – flaskehalser */}
        <Panel title="Venteoversikt" description="Flaskehalser i saksflyten">
          <VStack gap="3">
            <WaitTile
              icon={PersonCrossIcon}
              label="Ikke tildelte saker"
              value={waiting.unassigned}
              tone="error"
            />
            <WaitTile
              icon={Buildings2Icon}
              label="Venter på forvaltning"
              value={waiting.admin}
              tone="warning"
            />
            <WaitTile
              icon={ShieldIcon}
              label="Venter på politi"
              value={waiting.politi}
              tone="alt"
            />

            {/* Eldste åpne sak */}
            {nokkeltall.eldst && (
              <div className="mt-2 rounded-sm border border-border bg-surface-subtle p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Eldste åpne sak
                </p>
                <p className="text-sm font-semibold text-foreground">{nokkeltall.eldst.id}</p>
                <p className="text-xs text-muted-foreground">
                  Opprettet {formatDato(nokkeltall.eldst.createdAt)} · {nokkeltall.eldst.ageDays} dager
                </p>
              </div>
            )}
          </VStack>
        </Panel>
      </div>

      {/* ── Saker per kategori + kakediagram ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 mb-5">
        <Panel
          title="Saker per kategori"
          description="Fordeling på sakstype"
          className="xl:col-span-2"
        >
          <HorisontaltSoylediagram
            data={categoryData.map((c, i) => ({
              navn: c.category,
              antall: c.count,
              farge: KATEGORI_FARGER[i % KATEGORI_FARGER.length],
            }))}
            ariaLabel={`Søylediagram over saker per kategori. ${categoryData.map((c) => `${c.category}: ${c.count}`).join(", ")}`}
          />
        </Panel>

        <Panel title="Porteføljefordeling" description="Kakediagram per kategori">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  isAnimationActive={false}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={1}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={KATEGORI_FARGER[i % KATEGORI_FARGER.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [`${value} saker`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1">
            {categoryData.map((c, i) => {
              const total = categoryData.reduce((sum, d) => sum + d.count, 0);
              const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
              return (
                <li key={c.category} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: KATEGORI_FARGER[i % KATEGORI_FARGER.length] }} />
                    {c.category}
                  </span>
                  <span className="tabular-nums font-semibold text-foreground">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* ── Saksdrilldown ── */}
      {selectedStatus && (
        <div className="mb-5">
          <Panel
            title={`Saker med status: ${selectedStatus}`}
            description={`${filteredCases.length} saker`}
            contentClassName="p-0"
            actions={
              <button
                onClick={() => setSelectedStatus(null)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Lukk
              </button>
            }
          >
            <CaseTable rows={filteredCases} maxHeight="380px" />
          </Panel>
        </div>
      )}

      {/* ── Ansattoversikt ── */}
      <Panel
        title="Ansattoversikt"
        description="Portefølje per saksbehandler – klikk for å åpne saksliste"
        contentClassName="p-0"
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <PersonGroupIcon className="h-3.5 w-3.5" aria-hidden />
            {employeeRows.length} ansatte
          </span>
        }
      >
        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Ansatt</Table.HeaderCell>
              <Table.HeaderCell align="right">Tildelte</Table.HeaderCell>
              <Table.HeaderCell align="right">Aktive</Table.HeaderCell>
              <Table.HeaderCell align="right">Fullførte</Table.HeaderCell>
              <Table.HeaderCell align="right">Over frist</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {employeeRows.map((emp) => (
              <Table.Row
                key={emp.id}
                onClick={() => navigate(`/saksoversikt?ansatt=${emp.id}`)}
                className="cursor-pointer"
              >
                <Table.DataCell>{emp.name}</Table.DataCell>
                <Table.DataCell align="right">{emp.assigned}</Table.DataCell>
                <Table.DataCell align="right">{emp.active}</Table.DataCell>
                <Table.DataCell align="right">{emp.completed}</Table.DataCell>
                <Table.DataCell align="right">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      emp.overFrist > 0 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {emp.overFrist}
                  </span>
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Panel>
    </div>
  );
};

export default LederDashboard;
