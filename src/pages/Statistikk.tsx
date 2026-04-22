import { Panel } from "@/components/aksel/Panel";
import { Tag } from "@/components/aksel/Tag";
import { FileDown, FileSpreadsheet } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const flowData = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"][i],
  inn: 540 + Math.round(Math.sin(i / 2) * 80) + i * 5,
  ut: 510 + Math.round(Math.cos(i / 2) * 70) + i * 4,
}));

const processingTime = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"][i],
  behandling: 5.8 + Math.sin(i / 3) * 0.6,
  venting: 9.2 + Math.cos(i / 3) * 1.2,
}));

const backlogByAge = [
  { age: "0–14 d", count: 248, color: "hsl(145 63% 28%)" },
  { age: "15–30 d", count: 184, color: "hsl(211 100% 39%)" },
  { age: "31–60 d", count: 98, color: "hsl(35 100% 47%)" },
  { age: "61–90 d", count: 42, color: "hsl(20 90% 50%)" },
  { age: "> 90 d", count: 18, color: "hsl(4 71% 47%)" },
];

const byCategory = [
  { type: "AAP", behandlet: 412, innvilget: 318, avslått: 94 },
  { type: "Dagpenger", behandlet: 386, innvilget: 302, avslått: 84 },
  { type: "Bostøtte", behandlet: 298, innvilget: 254, avslått: 44 },
  { type: "Sykepenger", behandlet: 268, innvilget: 215, avslått: 53 },
  { type: "Foreldrepenger", behandlet: 184, innvilget: 162, avslått: 22 },
];

const Statistikk = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-sm border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rapportperiode</span>
          <select className="rounded-sm border border-input bg-background px-3 py-1.5 text-sm">
            <option>2. tertial 2025</option>
            <option>1. tertial 2025</option>
            <option>Hele 2025</option>
            <option>Egendefinert</option>
          </select>
          <span className="text-xs text-muted-foreground">Sist oppdatert: i dag kl. 09:42</span>
        </div>
        <div className="flex gap-1.5">
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
            <FileDown className="h-3.5 w-3.5" /> Eksporter rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Behandlet (tertial)</div>
          <div className="mt-1 text-2xl font-bold text-foreground">14 286</div>
          <div className="mt-1 text-xs text-success font-semibold">+6,8 % mot fjorår</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Snitt behandlingstid</div>
          <div className="mt-1 text-2xl font-bold text-foreground">5,4 d</div>
          <div className="mt-1 text-xs text-success font-semibold">−0,7 d</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Snitt ventetid</div>
          <div className="mt-1 text-2xl font-bold text-foreground">9,8 d</div>
          <div className="mt-1 text-xs text-destructive font-semibold">+1,2 d</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Restanser totalt</div>
          <div className="mt-1 text-2xl font-bold text-foreground">590</div>
          <div className="mt-1 text-xs text-warning font-semibold">+24 siste uke</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Inn- vs. utstrømning" description="Mottatte vs. ferdigstilte saker per måned">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="g-inn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(35 100% 47%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(35 100% 47%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-ut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(211 100% 39%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(211 100% 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }} />
                <Area type="monotone" dataKey="inn" name="Mottatt" stroke="hsl(35 100% 47%)" fill="url(#g-inn)" strokeWidth={2} />
                <Area type="monotone" dataKey="ut" name="Ferdigstilt" stroke="hsl(211 100% 39%)" fill="url(#g-ut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Behandlings- og ventetid" description="Snitt antall dager per måned">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processingTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }} />
                <Line type="monotone" dataKey="behandling" name="Behandlingstid" stroke="hsl(211 100% 39%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="venting" name="Ventetid" stroke="hsl(35 100% 47%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Restanser etter alder" description="Antall saker fordelt på alder i restansen">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backlogByAge}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {backlogByAge.map((b) => (
                    <Cell key={b.age} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Resultat per saktype" description="Behandlede saker fordelt på utfall" contentClassName="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Saktype</th>
                <th className="px-5 py-2.5 text-right font-semibold">Behandlet</th>
                <th className="px-5 py-2.5 text-right font-semibold">Innvilget</th>
                <th className="px-5 py-2.5 text-right font-semibold">Avslått</th>
                <th className="px-5 py-2.5 text-right font-semibold">Avslagsandel</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((c) => {
                const pct = Math.round((c.avslått / c.behandlet) * 100);
                return (
                  <tr key={c.type} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                    <td className="px-5 py-3 font-semibold text-foreground">{c.type}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.behandlet}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-success">{c.innvilget}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-destructive">{c.avslått}</td>
                    <td className="px-5 py-3 text-right">
                      <Tag tone={pct > 25 ? "warning" : "neutral"}>{pct} %</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};

export default Statistikk;
