import { Panel } from "@/components/aksel/Panel";
import { Tag } from "@/components/aksel/Tag";
import { MessageSquare, Calendar, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const employees = [
  { name: "Per Hagen", initials: "PH", behandlet: 38, snittTid: 4.2, kvalitet: 94, trend: "+6 %" },
  { name: "Marte Kvale", initials: "MK", behandlet: 32, snittTid: 5.1, kvalitet: 96, trend: "+2 %" },
  { name: "Lars Østby", initials: "LØ", behandlet: 19, snittTid: 7.8, kvalitet: 88, trend: "−4 %" },
  { name: "Anna Berg", initials: "AB", behandlet: 41, snittTid: 3.9, kvalitet: 97, trend: "+8 %" },
  { name: "Kim Tran", initials: "KT", behandlet: 14, snittTid: 9.2, kvalitet: 85, trend: "−2 %" },
  { name: "Eva Ruud", initials: "ER", behandlet: 36, snittTid: 4.6, kvalitet: 93, trend: "+3 %" },
];

const groupCompare = [
  { group: "Gruppe A", behandlet: 142, snittTid: 4.6 },
  { group: "Gruppe B", behandlet: 128, snittTid: 5.2 },
  { group: "Gruppe C", behandlet: 156, snittTid: 4.1 },
  { group: "Gruppe D", behandlet: 118, snittTid: 6.0 },
];

const Oppfolging = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-info/30 bg-info-surface p-4 text-sm text-[hsl(213_100%_24%)]">
        <strong>Tips:</strong> Tallene under er ment som <em>grunnlag for dialog og utvikling</em> – ikke ren rangering.
        Bruk «Planlegg samtale» for å sette opp 1:1 med utgangspunkt i konkrete saker.
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel
          title="Produksjon per gruppe"
          description="Behandlede saker denne uken"
          className="xl:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupCompare} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="group" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="behandlet" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Nøkkeltall enhet" description="Snitt for valgt enhet">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Snitt produksjon / ansatt</dt>
              <dd className="text-2xl font-bold text-foreground">30,0</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Snitt behandlingstid</dt>
              <dd className="text-2xl font-bold text-foreground">5,4 dager</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Snitt kvalitetsscore</dt>
              <dd className="text-2xl font-bold text-success">92 %</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Sykefravær (måned)</dt>
              <dd className="text-2xl font-bold text-foreground">4,1 %</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel
        title="Saksbehandlere – produksjon og oppfølging"
        description="Klikk «Planlegg samtale» for 1:1"
        contentClassName="p-0"
      >
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-semibold">Saksbehandler</th>
              <th className="px-5 py-2.5 text-right font-semibold">Behandlet (uke)</th>
              <th className="px-5 py-2.5 text-right font-semibold">Snitt tid (dager)</th>
              <th className="px-5 py-2.5 text-right font-semibold">Kvalitet</th>
              <th className="px-5 py-2.5 text-right font-semibold">Trend</th>
              <th className="px-5 py-2.5 text-right font-semibold">Handling</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.name} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {e.initials}
                    </div>
                    <span className="font-semibold text-foreground">{e.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">{e.behandlet}</td>
                <td className="px-5 py-3 text-right tabular-nums text-foreground">{e.snittTid}</td>
                <td className="px-5 py-3 text-right">
                  <Tag tone={e.kvalitet >= 95 ? "success" : e.kvalitet >= 90 ? "info" : "warning"}>
                    {e.kvalitet} %
                  </Tag>
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={
                      e.trend.startsWith("+")
                        ? "inline-flex items-center gap-1 text-sm font-semibold text-success"
                        : "inline-flex items-center gap-1 text-sm font-semibold text-destructive"
                    }
                  >
                    <TrendingUp className={e.trend.startsWith("+") ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
                    {e.trend}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                      <Calendar className="h-3.5 w-3.5" /> Planlegg samtale
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                      <MessageSquare className="h-3.5 w-3.5" /> Notat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
};

export default Oppfolging;
