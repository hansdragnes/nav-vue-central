import { Panel } from "@/components/aksel/Panel";
import { Tag } from "@/components/aksel/Tag";
import { Bell, Clock, AlertTriangle, CheckCircle2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertItem = {
  id: string;
  type: "deadline" | "overdue" | "completed" | "waiting";
  title: string;
  detail: string;
  recipient: "Leder" | "Ansatt" | "Begge";
  time: string;
  read?: boolean;
};

const alerts: AlertItem[] = [
  { id: "1", type: "overdue", title: "K-2024-09812 er 6 dager over frist", detail: "AAP – Eva Ruud. Ingen aktivitet siste 4 dager.", recipient: "Begge", time: "10 min siden" },
  { id: "2", type: "completed", title: "47 saker ferdigstilt av NAY", detail: "Returnert for arkivering. Ingen videre handling kreves.", recipient: "Leder", time: "1 t siden" },
  { id: "3", type: "deadline", title: "12 saker har frist innen 24 t", detail: "Fordelt på 5 saksbehandlere. Anbefaler omprioritering.", recipient: "Leder", time: "2 t siden" },
  { id: "4", type: "waiting", title: "Auto-purring sendt til Politiet", detail: "8 saker har ventet >14 dager på svar.", recipient: "Leder", time: "3 t siden", read: true },
  { id: "5", type: "completed", title: "NFP har ferdigstilt 9 saker", detail: "Saker er nå klare for vedtak.", recipient: "Begge", time: "5 t siden", read: true },
  { id: "6", type: "deadline", title: "Frist i morgen: K-2024-10921", detail: "Bostøtte – Per Hagen. Risiko: Høy.", recipient: "Ansatt", time: "I går", read: true },
];

const iconFor = (t: AlertItem["type"]) => {
  switch (t) {
    case "deadline": return { Icon: Clock, tone: "warning" as const };
    case "overdue": return { Icon: AlertTriangle, tone: "error" as const };
    case "completed": return { Icon: CheckCircle2, tone: "success" as const };
    case "waiting": return { Icon: Bell, tone: "info" as const };
  }
};

const labelFor = (t: AlertItem["type"]) => ({
  deadline: "Frist",
  overdue: "Over frist",
  completed: "Ferdigstilt",
  waiting: "Auto-purring",
}[t]);

const automationRules = [
  { name: "Påminnelse 3 dager før frist", recipient: "Ansatt", active: true },
  { name: "Varsel ved frist passert", recipient: "Leder + Ansatt", active: true },
  { name: "Auto-purring etter 14 dager venting", recipient: "Ekstern aktør", active: true },
  { name: "Daglig oppsummering av nye saker", recipient: "Leder", active: false },
  { name: "Varsel når NAY/NFP returnerer sak", recipient: "Leder", active: true },
];

const Varsler = () => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <Panel
        title="Innboks – varsler"
        description={`${alerts.filter((a) => !a.read).length} uleste`}
        className="xl:col-span-2"
        actions={
          <div className="flex gap-1.5">
            <button className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">Marker alle som lest</button>
            <button className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">Filter</button>
          </div>
        }
        contentClassName="p-0"
      >
        <ul>
          {alerts.map((a) => {
            const { Icon, tone } = iconFor(a.type);
            return (
              <li
                key={a.id}
                className={cn(
                  "flex items-start gap-3 border-b border-border px-5 py-4 last:border-0 hover:bg-surface-subtle",
                  !a.read && "bg-info-surface/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm",
                    tone === "error" && "bg-destructive-surface text-destructive",
                    tone === "warning" && "bg-warning-surface text-warning",
                    tone === "success" && "bg-success-surface text-success",
                    tone === "info" && "bg-info-surface text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag tone={tone}>{labelFor(a.type)}</Tag>
                    <span className="text-xs text-muted-foreground">Mottaker: {a.recipient}</span>
                    {!a.read && <span className="ml-auto inline-block h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{a.title}</div>
                  <div className="text-sm text-muted-foreground">{a.detail}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.time}</div>
                </div>
                <button className="rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted">
                  Åpne
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title="Automatiseringsregler"
        description="Slå av/på automatiske varsler"
        actions={
          <button className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-muted">
            <Settings2 className="h-3.5 w-3.5" /> Avansert
          </button>
        }
      >
        <ul className="space-y-3">
          {automationRules.map((r) => (
            <li key={r.name} className="flex items-start justify-between gap-3 rounded-sm border border-border bg-surface-subtle p-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Til: {r.recipient}</div>
              </div>
              <button
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  r.active ? "bg-primary" : "bg-border",
                )}
                aria-pressed={r.active}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all",
                    r.active ? "left-[22px]" : "left-0.5",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};

export default Varsler;
