import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserX, Building2, Shield } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Panel } from "@/components/aksel/Panel";
import { ScopeBar, type Period, type Scope } from "@/components/aksel/ScopeBar";
import { CaseTable } from "@/components/CaseTable";
import { cn } from "@/lib/utils";
import {
  CASE_CATEGORIES,
  CASE_STATUSES,
  CASES,
  EMPLOYEES,
  type CaseStatus,
  ACTIVE_STATUSES,
  type CaseRow,
} from "@/data/cases";

const statusColor: Record<CaseStatus, string> = {
  "Ny": "hsl(211 100% 39%)",
  "Under behandling": "hsl(211 100% 60%)",
  "Venter på bruker": "hsl(35 100% 47%)",
  "Venter på administrasjon": "hsl(28 90% 55%)",
  "Venter på politi": "hsl(280 50% 55%)",
  "Til godkjenning": "hsl(213 67% 30%)",
  "Ferdig": "hsl(145 63% 28%)",
};

const categoryColors = [
  "hsl(211 100% 39%)",
  "hsl(145 63% 35%)",
  "hsl(35 100% 47%)",
  "hsl(280 50% 55%)",
  "hsl(213 67% 30%)",
  "hsl(0 70% 50%)",
  "hsl(190 70% 40%)",
  "hsl(45 90% 50%)",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope>("Min avdeling");
  const [period, setPeriod] = useState<Period>("Ingen");
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | null>(null);

  // Filtrering på nivå/periode (mock — dataen er den samme, men vi later som)
  const scopedCases = useMemo(() => {
    // Forenklet: "Min enhet" viser et utsnitt
    if (scope === "Min enhet") {
      const unitEmployees = EMPLOYEES.filter((e) => e.unit === "Kontroll Øst").map((e) => e.id);
      return CASES.filter(
        (c) => c.employeeId === null || unitEmployees.includes(c.employeeId),
      );
    }
    return CASES;
  }, [scope]);

  const periodCases = useMemo(() => {
    if (period === "Ingen") return scopedCases;
    const cutoff =
      period === "Måned hittil" ? 25 : period === "Inneværende tertial" ? 90 : 200;
    return scopedCases.filter((c) => c.ageDays <= cutoff);
  }, [scopedCases, period]);

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

  const waiting = useMemo(() => {
    return {
      unassigned: periodCases.filter((c) => c.employeeId === null && c.status !== "Ferdig").length,
      admin: periodCases.filter((c) => c.status === "Venter på administrasjon").length,
      politi: periodCases.filter((c) => c.status === "Venter på politi").length,
    };
  }, [periodCases]);

  const employeeRows = useMemo(() => {
    const unitEmployees =
      scope === "Min enhet"
        ? EMPLOYEES.filter((e) => e.unit === "Kontroll Øst")
        : EMPLOYEES;
    return unitEmployees.map((emp) => {
      const own = periodCases.filter((c) => c.employeeId === emp.id);
      return {
        id: emp.id,
        name: emp.name,
        assigned: own.length,
        active: own.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
        completed: own.filter((c) => c.status === "Ferdig").length,
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {/* 1. Saker per kategori */}
        <Panel
          title="Saker per kategori"
          description="Fordeling av portefølje på sakstype"
          className="xl:col-span-2"
        >
          <div className="flex items-center gap-6">
            <div className="h-64 w-64 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={1}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={categoryColors[i % categoryColors.length]} />
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
            <ul className="flex-1 space-y-2">
              {categoryData.map((c, i) => {
                const total = categoryData.reduce((sum, d) => sum + d.count, 0);
                const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                return (
                  <li
                    key={c.category}
                    className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-0"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ background: categoryColors[i % categoryColors.length] }}
                      />
                      <span className="text-sm font-medium text-foreground">{c.category}</span>
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      <span className="font-semibold text-foreground">{c.count}</span>
                      <span className="ml-2 text-xs">{pct}%</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>

        {/* 2. Saksstatus – klikkbar */}
        <Panel
          title="Saksstatus"
          description="Klikk en status for å se saker i listen under"
          actions={
            selectedStatus ? (
              <button
                onClick={() => setSelectedStatus(null)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Nullstill valg
              </button>
            ) : null
          }
        >
          <ul className="divide-y divide-border">
            {statusData.map((s) => {
              const isActive = selectedStatus === s.status;
              return (
                <li key={s.status}>
                  <button
                    onClick={() => setSelectedStatus(isActive ? null : s.status)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-1 py-2.5 text-left transition-colors hover:bg-surface-subtle",
                      isActive && "bg-secondary",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ background: statusColor[s.status] }}
                      />
                      <span className="text-sm font-medium text-foreground">{s.status}</span>
                    </span>
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {s.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* 3. Venteoversikt */}
        <Panel title="Venteoversikt" description="Flaskehalser i saksflyten">
          <div className="space-y-3">
            <WaitTile
              icon={UserX}
              label="Ikke tildelte saker"
              value={waiting.unassigned}
              tone="error"
            />
            <WaitTile
              icon={Building2}
              label="Venter på administrasjon"
              value={waiting.admin}
              tone="warning"
            />
            <WaitTile
              icon={Shield}
              label="Venter på politi"
              value={waiting.politi}
              tone="alt"
            />
          </div>
        </Panel>

        {/* 4. Saker med valgt status */}
        <Panel
          title={
            selectedStatus
              ? `Saker med status: ${selectedStatus}`
              : "Saker med status"
          }
          description={
            selectedStatus
              ? `${filteredCases.length} saker`
              : "Velg en status i Saksstatus-flisen for å se saker her"
          }
          className="xl:col-span-2"
          contentClassName="p-0"
          actions={
            selectedStatus ? (
              <button
                onClick={() => setSelectedStatus(null)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Lukk
              </button>
            ) : null
          }
        >
          {selectedStatus ? (
            <CaseTable rows={filteredCases} maxHeight="420px" />
          ) : (
            <div className="flex h-48 items-center justify-center px-5 text-sm text-muted-foreground">
              Ingen status valgt
            </div>
          )}
        </Panel>
      </div>

      {/* Ansattoversikt – nederst, full bredde */}
      <div className="mt-5">
        <Panel
          title="Ansattoversikt"
          description="Klikk en ansatt for å åpne deres saker"
          contentClassName="p-0"
          actions={
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {employeeRows.length} ansatte
            </span>
          }
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Ansatt</th>
                <th className="px-5 py-2.5 text-right font-semibold">Tildelte</th>
                <th className="px-5 py-2.5 text-right font-semibold">Aktive</th>
                <th className="px-5 py-2.5 text-right font-semibold">Fullførte</th>
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/saksoversikt?ansatt=${emp.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-subtle"
                >
                  <td className="px-5 py-3 font-medium text-foreground">{emp.name}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-foreground">{emp.assigned}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-foreground">{emp.active}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {emp.completed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};

interface WaitTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "error" | "warning" | "alt";
}

const toneClasses: Record<WaitTileProps["tone"], string> = {
  error: "border-l-destructive bg-destructive-surface/40 text-destructive",
  warning: "border-l-warning bg-warning-surface/40 text-[hsl(28_80%_28%)]",
  alt: "border-l-[hsl(280_50%_55%)] bg-[hsl(280_60%_96%)] text-[hsl(280_50%_30%)]",
};

const WaitTile = ({ icon: Icon, label, value, tone }: WaitTileProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 rounded-sm border border-border border-l-4 p-3",
      toneClasses[tone],
    )}
  >
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5" />
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
    <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
  </div>
);

export default Dashboard;
