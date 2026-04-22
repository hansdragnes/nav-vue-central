import { Panel } from "@/components/aksel/Panel";
import { Tag } from "@/components/aksel/Tag";
import { Sparkles, MoveHorizontal, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const employees = [
  { name: "Per Hagen", initials: "PH", role: "Kontrollør", capacity: 24, current: 28, types: ["AAP", "Bostøtte"], skill: "Senior" },
  { name: "Marte Kvale", initials: "MK", role: "Kontrollør", capacity: 22, current: 18, types: ["Dagpenger", "Sykepenger"], skill: "Senior" },
  { name: "Lars Østby", initials: "LØ", role: "Kontrollør", capacity: 20, current: 12, types: ["Bostøtte"], skill: "Junior" },
  { name: "Anna Berg", initials: "AB", role: "Kontrollør", capacity: 25, current: 24, types: ["AAP", "Sykepenger", "Foreldrepenger"], skill: "Senior" },
  { name: "Kim Tran", initials: "KT", role: "Kontrollør", capacity: 18, current: 8, types: ["Foreldrepenger"], skill: "Junior" },
  { name: "Eva Ruud", initials: "ER", role: "Kontrollør", capacity: 24, current: 26, types: ["AAP", "Dagpenger"], skill: "Senior" },
];

const unassigned = [
  { id: "K-2024-11512", type: "AAP", risk: "Høy", deadline: "2 dager", suggested: "Anna Berg" },
  { id: "K-2024-11518", type: "Dagpenger", risk: "Middels", deadline: "5 dager", suggested: "Marte Kvale" },
  { id: "K-2024-11520", type: "Bostøtte", risk: "Lav", deadline: "10 dager", suggested: "Lars Østby" },
  { id: "K-2024-11525", type: "Foreldrepenger", risk: "Middels", deadline: "4 dager", suggested: "Kim Tran" },
  { id: "K-2024-11528", type: "Sykepenger", risk: "Høy", deadline: "1 dag", suggested: "Anna Berg" },
];

const Fordeling = () => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Ufordelte saker</div>
          <div className="mt-1 text-2xl font-bold text-foreground">47</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Overbelastet</div>
          <div className="mt-1 text-2xl font-bold text-destructive">3 ansatte</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Ledig kapasitet</div>
          <div className="mt-1 text-2xl font-bold text-success">42 saker</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Snitt belegg</div>
          <div className="mt-1 text-2xl font-bold text-foreground">94 %</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Unassigned cases column */}
        <Panel
          title="Ufordelte saker"
          description="Dra til en ansatt, eller bruk forslag"
          actions={
            <button className="inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Sparkles className="h-3.5 w-3.5" /> Foreslå fordeling
            </button>
          }
        >
          <ul className="space-y-2">
            {unassigned.map((c) => (
              <li
                key={c.id}
                className="cursor-grab rounded-sm border border-border bg-surface-subtle p-3 hover:border-primary hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                  <Tag
                    tone={c.risk === "Høy" ? "error" : c.risk === "Middels" ? "warning" : "neutral"}
                  >
                    {c.risk}
                  </Tag>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{c.type}</span>
                  <span className="text-xs text-muted-foreground">Frist {c.deadline}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 rounded-sm bg-info-surface px-2 py-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-[hsl(213_100%_24%)]">
                    <Sparkles className="h-3 w-3" />
                    Forslag: <strong>{c.suggested}</strong>
                  </span>
                  <button className="font-semibold text-primary hover:text-primary-hover">Tildel</button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Employees column */}
        <Panel
          title="Saksbehandlere – kapasitet"
          description="Belegg, kompetanse og fagområder"
          className="xl:col-span-2"
          contentClassName="p-0"
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Saksbehandler</th>
                <th className="px-4 py-2.5 text-left font-semibold">Belegg</th>
                <th className="px-4 py-2.5 text-left font-semibold">Fagområder</th>
                <th className="px-4 py-2.5 text-left font-semibold">Nivå</th>
                <th className="px-4 py-2.5 text-right font-semibold">Handling</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const pct = Math.round((e.current / e.capacity) * 100);
                const over = pct > 100;
                return (
                  <tr key={e.name} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {e.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 w-64">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn("font-semibold", over ? "text-destructive" : "text-foreground")}>
                          {e.current} / {e.capacity} ({pct} %)
                        </span>
                        {over && (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-3 w-3" /> Over kap.
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            over ? "bg-destructive" : pct > 85 ? "bg-warning" : "bg-success",
                          )}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {e.types.map((t) => (
                          <Tag key={t} tone="neutral">
                            {t}
                          </Tag>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Tag tone={e.skill === "Senior" ? "info" : "alt"}>{e.skill}</Tag>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                        <MoveHorizontal className="h-3.5 w-3.5" /> Omfordel
                      </button>
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

export default Fordeling;
