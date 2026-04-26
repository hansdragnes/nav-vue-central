import type { CaseRow } from "@/data/cases";
import { employeeName } from "@/data/cases";
import { Tag } from "@/components/aksel/Tag";

function statusTone(status: CaseRow["status"]) {
  if (status === "Ny") return "info" as const;
  if (status === "Under behandling") return "info" as const;
  if (status.startsWith("Venter")) return "warning" as const;
  if (status === "Til godkjenning") return "alt" as const;
  if (status === "Ferdig") return "success" as const;
  return "neutral" as const;
}

function ageTone(days: number) {
  if (days > 30) return "error" as const;
  if (days > 14) return "warning" as const;
  return "neutral" as const;
}

interface CaseTableProps {
  rows: CaseRow[];
  hideEmployee?: boolean;
  onAssign?: (row: CaseRow) => void;
  emptyText?: string;
  maxHeight?: string;
}

export const CaseTable = ({
  rows,
  hideEmployee,
  onAssign,
  emptyText = "Ingen saker å vise.",
  maxHeight,
}: CaseTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">{emptyText}</div>
    );
  }

  return (
    <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-2.5 text-left font-semibold">Saks-ID</th>
            <th className="px-5 py-2.5 text-left font-semibold">Kategori</th>
            <th className="px-5 py-2.5 text-left font-semibold">Status</th>
            <th className="px-5 py-2.5 text-right font-semibold">Alder</th>
            {!hideEmployee && (
              <th className="px-5 py-2.5 text-left font-semibold">Saksbehandler</th>
            )}
            {onAssign && <th className="px-5 py-2.5 text-right font-semibold">Handling</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-surface-subtle"
            >
              <td className="px-5 py-2.5 font-mono text-xs text-foreground">{row.id}</td>
              <td className="px-5 py-2.5 text-foreground">{row.category}</td>
              <td className="px-5 py-2.5">
                <Tag tone={statusTone(row.status)}>{row.status}</Tag>
              </td>
              <td className="px-5 py-2.5 text-right">
                <Tag tone={ageTone(row.ageDays)}>{row.ageDays} d</Tag>
              </td>
              {!hideEmployee && (
                <td className="px-5 py-2.5 text-muted-foreground">
                  {row.employeeId ? employeeName(row.employeeId) : (
                    <span className="italic text-destructive">Ikke tildelt</span>
                  )}
                </td>
              )}
              {onAssign && (
                <td className="px-5 py-2.5 text-right">
                  <button
                    onClick={() => onAssign(row)}
                    className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-surface-muted"
                  >
                    {row.employeeId ? "Endre" : "Tildel"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
