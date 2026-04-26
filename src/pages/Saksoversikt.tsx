import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Panel } from "@/components/aksel/Panel";
import { ScopeBar, type Period, type Scope } from "@/components/aksel/ScopeBar";
import { CaseTable } from "@/components/CaseTable";
import {
  CASES,
  CASE_STATUSES,
  EMPLOYEES,
  employeeName,
  type CaseRow,
  type CaseStatus,
} from "@/data/cases";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Saksoversikt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [scope, setScope] = useState<Scope>("Min avdeling");
  const [period, setPeriod] = useState<Period>("Ingen");
  const [employeeFilter, setEmployeeFilter] = useState<string>(
    searchParams.get("ansatt") ?? "alle",
  );
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [cases, setCases] = useState<CaseRow[]>(CASES);

  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    row?: CaseRow;
    selected?: string;
  }>({ open: false });

  // Sync employeeFilter ↔ URL
  useEffect(() => {
    const fromUrl = searchParams.get("ansatt");
    if (fromUrl && fromUrl !== employeeFilter) {
      setEmployeeFilter(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setEmployee = (id: string) => {
    setEmployeeFilter(id);
    if (id === "alle") {
      searchParams.delete("ansatt");
    } else {
      searchParams.set("ansatt", id);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const scopedCases = useMemo(() => {
    let rows = cases;
    if (scope === "Min enhet") {
      const unitEmployees = EMPLOYEES.filter((e) => e.unit === "Kontroll Øst").map(
        (e) => e.id,
      );
      rows = rows.filter(
        (c) => c.employeeId === null || unitEmployees.includes(c.employeeId),
      );
    }
    if (period !== "Ingen") {
      const cutoff =
        period === "Måned hittil" ? 25 : period === "Inneværende tertial" ? 90 : 200;
      rows = rows.filter((c) => c.ageDays <= cutoff);
    }
    return rows;
  }, [cases, scope, period]);

  const filteredCases = useMemo(() => {
    let rows = scopedCases;
    if (employeeFilter !== "alle") {
      if (employeeFilter === "ikke-tildelt") {
        rows = rows.filter((c) => c.employeeId === null);
      } else {
        rows = rows.filter((c) => c.employeeId === employeeFilter);
      }
    }
    if (statusFilter !== "alle") {
      rows = rows.filter((c) => c.status === (statusFilter as CaseStatus));
    }
    return rows;
  }, [scopedCases, employeeFilter, statusFilter]);

  const handlerLabel =
    employeeFilter === "alle"
      ? "Alle saksbehandlere"
      : employeeFilter === "ikke-tildelt"
        ? "Ikke tildelt"
        : employeeName(employeeFilter);

  const openAssign = (row: CaseRow) => {
    setAssignDialog({ open: true, row, selected: row.employeeId ?? undefined });
  };

  const confirmAssign = () => {
    const { row, selected } = assignDialog;
    if (!row) return;
    const newId = selected === "ikke-tildelt" || !selected ? null : selected;
    setCases((prev) =>
      prev.map((c) => (c.id === row.id ? { ...c, employeeId: newId } : c)),
    );
    toast({
      title: "Sak tildelt",
      description: `${row.id} → ${newId ? employeeName(newId) : "Ikke tildelt"}`,
    });
    setAssignDialog({ open: false });
  };

  return (
    <div>
      <ScopeBar
        scope={scope}
        onScopeChange={setScope}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-sm border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Saksbehandler
          </label>
          <Select value={employeeFilter} onValueChange={setEmployee}>
            <SelectTrigger className="w-64 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle saksbehandlere</SelectItem>
              <SelectItem value="ikke-tildelt">Ikke tildelt</SelectItem>
              {EMPLOYEES.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle statuser</SelectItem>
              {CASE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Viser <span className="font-semibold text-foreground">{filteredCases.length}</span> saker
        </div>
      </div>

      <Panel
        title={handlerLabel}
        description={`${scope} · ${period === "Ingen" ? "Alle perioder" : period}`}
        contentClassName="p-0"
      >
        <CaseTable
          rows={filteredCases}
          hideEmployee={
            employeeFilter !== "alle" && employeeFilter !== "ikke-tildelt"
          }
          onAssign={openAssign}
        />
      </Panel>

      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) =>
          setAssignDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle>Tildel saksbehandler</DialogTitle>
            <DialogDescription>
              Sak <span className="font-mono">{assignDialog.row?.id}</span> –{" "}
              {assignDialog.row?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Saksbehandler
            </label>
            <Select
              value={assignDialog.selected ?? "ikke-tildelt"}
              onValueChange={(v) =>
                setAssignDialog((prev) => ({ ...prev, selected: v }))
              }
            >
              <SelectTrigger className="rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ikke-tildelt">Ikke tildelt</SelectItem>
                {EMPLOYEES.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} · {e.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              onClick={() => setAssignDialog({ open: false })}
              className="rounded-sm border border-border px-3 py-2 text-sm font-semibold hover:bg-surface-muted"
            >
              Avbryt
            </button>
            <button
              onClick={confirmAssign}
              className="rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Lagre tildeling
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Saksoversikt;
