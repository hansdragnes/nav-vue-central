import { ChevronRight, Clock, AlertCircle } from "lucide-react";
import { Panel } from "@/components/aksel/Panel";
import { Tag } from "@/components/aksel/Tag";
import { useState } from "react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "mottak", label: "Mottak", count: 312, sla: "0–2 dager", tone: "info" as const },
  { id: "vurdering", label: "Vurdering", count: 486, sla: "2–10 dager", tone: "info" as const },
  { id: "kontroll", label: "Kontroll", count: 528, sla: "5–20 dager", tone: "info" as const },
  { id: "venter", label: "Venter på eksterne", count: 286, sla: "Variabel", tone: "warning" as const },
  { id: "vedtak", label: "Vedtak", count: 198, sla: "1–3 dager", tone: "info" as const },
  { id: "ferdig", label: "Ferdigstilt", count: 642, sla: "—", tone: "success" as const },
];

const waitingReasons = [
  { reason: "Venter på Politiet", count: 124, avgDays: 18 },
  { reason: "Venter på NAY", count: 86, avgDays: 9 },
  { reason: "Venter på NFP", count: 42, avgDays: 12 },
  { reason: "Venter på bruker", count: 34, avgDays: 6 },
];

const sampleCases = [
  { id: "K-2024-10921", type: "Bostøtte", stage: "Kontroll", next: "Vedtak", waiting: null, owner: "Per H.", days: 12 },
  { id: "K-2024-10988", type: "AAP", stage: "Venter på eksterne", next: "Kontroll", waiting: "Politiet", owner: "Marte K.", days: 24 },
  { id: "K-2024-11042", type: "Dagpenger", stage: "Vurdering", next: "Kontroll", waiting: null, owner: "Lars Ø.", days: 4 },
  { id: "K-2024-11108", type: "Sykepenger", stage: "Venter på eksterne", next: "Vedtak", waiting: "NAY", owner: "Anna B.", days: 9 },
  { id: "K-2024-11305", type: "Foreldrepenger", stage: "Mottak", next: "Vurdering", waiting: null, owner: "Kim T.", days: 1 },
  { id: "K-2024-11410", type: "AAP", stage: "Vedtak", next: "Ferdigstilt", waiting: null, owner: "Eva R.", days: 18 },
];

const Saksflyt = () => {
  const [selected, setSelected] = useState<string | null>("kontroll");

  return (
    <div className="space-y-5">
      <Panel
        title="Verdikjede – saksflyt"
        description="Antall saker i hvert prosessteg. Klikk for å filtrere listen under."
      >
        <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-stretch gap-1">
              <button
                onClick={() => setSelected(stage.id)}
                className={cn(
                  "group min-w-[170px] rounded-sm border-2 p-4 text-left transition-all",
                  selected === stage.id
                    ? "border-primary bg-info-surface shadow-sm"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Steg {i + 1}
                  </span>
                  <Tag tone={stage.tone}>{stage.sla}</Tag>
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-foreground">{stage.count}</div>
                <div className="text-sm font-semibold text-foreground">{stage.label}</div>
              </button>
              {i < stages.length - 1 && (
                <div className="flex items-center text-muted-foreground">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Ventestatus" description="Hvorfor saker står på vent" className="xl:col-span-1">
          <ul className="space-y-3">
            {waitingReasons.map((w) => (
              <li key={w.reason} className="rounded-sm border border-border bg-surface-subtle p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{w.reason}</span>
                  <Tag tone="warning">{w.count}</Tag>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Snitt ventetid: <span className="font-semibold text-foreground">{w.avgDays} dager</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{ width: `${Math.min(100, w.avgDays * 4)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Saker i valgt steg"
          description={selected ? `Viser saker i: ${stages.find((s) => s.id === selected)?.label}` : "Velg et steg over"}
          className="xl:col-span-2"
          contentClassName="p-0"
          actions={
            <div className="flex items-center gap-2">
              <button className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                Eksporter
              </button>
              <button className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
                Fordel valgte
              </button>
            </div>
          }
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-8 px-3 py-2.5"><input type="checkbox" /></th>
                <th className="px-3 py-2.5 text-left font-semibold">Saksnr.</th>
                <th className="px-3 py-2.5 text-left font-semibold">Type</th>
                <th className="px-3 py-2.5 text-left font-semibold">Steg</th>
                <th className="px-3 py-2.5 text-left font-semibold">Venter på</th>
                <th className="px-3 py-2.5 text-left font-semibold">Neste steg</th>
                <th className="px-3 py-2.5 text-left font-semibold">Eier</th>
                <th className="px-3 py-2.5 text-right font-semibold">Alder</th>
              </tr>
            </thead>
            <tbody>
              {sampleCases.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-subtle">
                  <td className="px-3 py-3"><input type="checkbox" /></td>
                  <td className="px-3 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-3 py-3 text-foreground">{c.type}</td>
                  <td className="px-3 py-3">
                    <Tag tone={c.stage.startsWith("Venter") ? "warning" : "info"}>{c.stage}</Tag>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {c.waiting ? (
                      <span className="inline-flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-warning" /> {c.waiting}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{c.next}</td>
                  <td className="px-3 py-3 text-foreground">{c.owner}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className={cn(c.days > 14 ? "font-semibold text-destructive" : "text-muted-foreground")}>
                      {c.days} d
                    </span>
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

export default Saksflyt;
