import type { CaseRow } from "@/data/cases";
import { employeeName } from "@/data/cases";
import { Tag, Button, Table } from "@navikt/ds-react";

function statusVariant(status: CaseRow["status"]): "neutral" | "info" | "success" | "warning" | "error" | "alt" {
  if (status === "Ny") return "info";
  if (status === "Under behandling") return "info";
  if (status.startsWith("Venter")) return "warning";
  if (status === "Henlagt") return "alt";
  if (status === "Ferdig") return "success";
  return "neutral";
}

function ageVariant(days: number): "neutral" | "warning" | "error" {
  if (days > 30) return "error";
  if (days > 14) return "warning";
  return "neutral";
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
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Saks-ID</Table.HeaderCell>
            <Table.HeaderCell>Kategori</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell align="right">Alder</Table.HeaderCell>
            {!hideEmployee && <Table.HeaderCell>Saksbehandler</Table.HeaderCell>}
            {onAssign && <Table.HeaderCell align="right">Handling</Table.HeaderCell>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.id}>
              <Table.DataCell>
                <span className="font-mono text-xs text-foreground">{row.id}</span>
              </Table.DataCell>
              <Table.DataCell>{row.category}</Table.DataCell>
              <Table.DataCell>
                <Tag variant={statusVariant(row.status)} size="small">{row.status}</Tag>
              </Table.DataCell>
              <Table.DataCell align="right">
                <Tag variant={ageVariant(row.ageDays)} size="small">{row.ageDays} d</Tag>
              </Table.DataCell>
              {!hideEmployee && (
                <Table.DataCell>
                  {row.employeeId ? employeeName(row.employeeId) : (
                    <span className="italic text-destructive">Ikke tildelt</span>
                  )}
                </Table.DataCell>
              )}
              {onAssign && (
                <Table.DataCell align="right">
                  <Button
                    variant="secondary"
                    size="xsmall"
                    onClick={() => onAssign(row)}
                  >
                    {row.employeeId ? "Endre" : "Tildel"}
                  </Button>
                </Table.DataCell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
