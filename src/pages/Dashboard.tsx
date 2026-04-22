import { useState } from "react";
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { KpiCard } from "@/components/aksel/KpiCard";
import { Panel } from "@/components/aksel/Panel";
import { FilterBar } from "@/components/aksel/FilterBar";
import { Tag } from "@/components/aksel/Tag";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const productionData = [
  { day: "Man", behandlet: 142, mottatt: 158 },
  { day: "Tir", behandlet: 168, mottatt: 151 },
  { day: "Ons", behandlet: 175, mottatt: 162 },
  { day: "Tor", behandlet: 159, mottatt: 170 },
  { day: "Fre", behandlet: 188, mottatt: 144 },
  { day: "Lør", behandlet: 42, mottatt: 22 },
  { day: "Søn", behandlet: 18, mottatt: 12 },
];

const statusData = [
  { name: "Ny", value: 312, color: "hsl(211 100% 39%)" },
  { name: "Under behandling", value: 814, color: "hsl(211 100% 60%)" },
  { name: "Venter", value: 286, color: "hsl(35 100% 47%)" },
  { name: "Ferdig (uke)", value: 642, color: "hsl(145 63% 28%)" },
];

const upcomingDeadlines = [
  { id: "K-2024-10921", type: "Bostøtte – etterkontroll", assignee: "Per H.", days: 1, risk: "Høy" },
  { id: "K-2024-11042", type: "AAP – revurdering", assignee: "Marte K.", days: 2, risk: "Middels" },
  { id: "K-2024-11108", type: "Dagpenger – kontroll", assignee: "Lars Ø.", days: 3, risk: "Lav" },
  { id: "K-2024-11220", type: "Sykepenger – etterkontroll", assignee: "Anna B.", days: 3, risk: "Middels" },
  { id: "K-2024-11305", type: "Foreldrepenger", assignee: "Kim T.", days: 4, risk: "Lav" },
];

const overdueAlerts = [
  { id: "K-2024-09812", type: "AAP", days: 6, owner: "Eva R." },
  { id: "K-2024-09844", type: "Dagpenger", days: 4, owner: "Jonas L." },
  { id: "K-2024-09901", type: "Bostøtte", days: 2, owner: "Mira S." },
];

const Dashboard = () => {
  const [scope, setScope] = useState("Avdeling");
  const [period, setPeriod] = useState("Denne uka");

  return (
    <div>
      <FilterBar
        scopes={["Individ", "Gruppe", "Enhet", "Avdeling"]}
        active={scope}
        onChange={setScope}
        activePeriod={period}
        onPeriodChange={setPeriod}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total produksjon"
          value="1 892"
          delta={{ value: "+8,4 %", direction: "up", positive: true }}
          hint="Mot forrige uke"
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Saker i portefølje"
          value="2 454"
          delta={{ value: "+112", direction: "up", positive: false }}
          hint="Netto endring"
          icon={Briefcase}
        />
        <KpiCard
          label="Restanser"
          value="318"
          delta={{ value: "+24", direction: "up", positive: false }}
          hint="Eldre enn 30 dager"
          icon={AlertTriangle}
          tone="error"
        />
        <KpiCard
          label="Frister neste 7 dager"
          value="146"
          delta={{ value: "12 over frist", direction: "up", positive: false }}
          hint="Krever prioritering"
          icon={Clock}
          tone="warning"
        />
        <KpiCard
          label="Ferdigstilt denne uken"
          value="642"
          delta={{ value: "+5,2 %", direction: "up", positive: true }}
          hint="Snitt 128/dag"
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Produksjon vs. innstrømning"
          description="Behandlede saker sammenlignet med mottatte saker per dag"
          actions={
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Behandlet
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Mottatt
              </span>
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="behandlet" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="mottatt" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Saksstatus" description="Fordeling av portefølje">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="square"
                  iconSize={10}
                  formatter={(v) => <span className="text-xs text-foreground">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Lists */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Kommende frister"
          description="Neste 7 dager – sortert etter risiko og frist"
          actions={
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              Se alle <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
          contentClassName="p-0"
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Saksnr.</th>
                <th className="px-5 py-2.5 text-left font-semibold">Type</th>
                <th className="px-5 py-2.5 text-left font-semibold">Saksbehandler</th>
                <th className="px-5 py-2.5 text-left font-semibold">Risiko</th>
                <th className="px-5 py-2.5 text-right font-semibold">Frist</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDeadlines.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                  <td className="px-5 py-3 font-mono text-xs text-foreground">{row.id}</td>
                  <td className="px-5 py-3 text-foreground">{row.type}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.assignee}</td>
                  <td className="px-5 py-3">
                    <Tag tone={row.risk === "Høy" ? "error" : row.risk === "Middels" ? "warning" : "neutral"}>
                      {row.risk}
                    </Tag>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">
                    {row.days === 1 ? "I morgen" : `Om ${row.days} dager`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Saker over frist"
          description="Krever umiddelbar handling"
          actions={<Tag tone="error">{overdueAlerts.length} saker</Tag>}
        >
          <ul className="space-y-3">
            {overdueAlerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-sm border-l-4 border-destructive bg-destructive-surface/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                    <div className="text-sm font-semibold text-foreground">{a.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive">{a.days} dager over frist</div>
                  <div className="text-xs text-muted-foreground">Eier: {a.owner}</div>
                </div>
                <button className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
                  Tildel på nytt
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;
