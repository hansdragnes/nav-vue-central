import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Panel } from "@/components/aksel/Panel";
import { CaseTable } from "@/components/CaseTable";
import {
  CASES,
  CASE_CATEGORIES,
  CASE_STATUSES,
  EMPLOYEES,
  employeeName,
  type CaseCategory,
  type CaseRow,
  type CaseStatus,
} from "@/data/cases";
import {
  BodyShort,
  Button,
  Heading,
  HStack,
  Modal,
  Select,
  Tag,
} from "@navikt/ds-react";
import { XMarkIcon, FunnelIcon } from "@navikt/aksel-icons";
import { cn } from "@/lib/utils";

// ─── Hjelpere ────────────────────────────────────────────────────────────────

function ansattLabel(id: string): string {
  if (id === "alle") return "Alle saksbehandlere";
  if (id === "ikke-tildelt") return "Ikke tildelt";
  return employeeName(id);
}

// ─── Komponent ────────────────────────────────────────────────────────────────

const Saksoversikt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // ── Filtertilstand – alltid synkronisert med URL ──
  const statusParam   = searchParams.get("status")   ?? "alle";
  const kategoriParam = searchParams.get("kategori") ?? "alle";
  const ansattParam   = searchParams.get("ansatt")   ?? "alle";

  const [cases, setCases] = useState<CaseRow[]>(CASES);

  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    row?: CaseRow;
    selected?: string;
  }>({ open: false });

  // ── Sett én URL-param og bevar de andre ──
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "alle") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const nullstillAlle = () => setSearchParams({}, { replace: true });

  // ── Filtrering ──
  const filteredCases = useMemo(() => {
    let rows = cases;
    if (ansattParam !== "alle") {
      rows = ansattParam === "ikke-tildelt"
        ? rows.filter((c) => c.employeeId === null)
        : rows.filter((c) => c.employeeId === ansattParam);
    }
    if (statusParam !== "alle") {
      rows = rows.filter((c) => c.status === (statusParam as CaseStatus));
    }
    if (kategoriParam !== "alle") {
      rows = rows.filter((c) => c.category === (kategoriParam as CaseCategory));
    }
    return rows;
  }, [cases, ansattParam, statusParam, kategoriParam]);

  const harAktiveFiltre =
    statusParam !== "alle" || kategoriParam !== "alle" || ansattParam !== "alle";

  // ── Aktive filtre som badges ──
  const aktiveBadger: { label: string; key: string }[] = [];
  if (statusParam   !== "alle") aktiveBadger.push({ label: statusParam,          key: "status"   });
  if (kategoriParam !== "alle") aktiveBadger.push({ label: kategoriParam,        key: "kategori" });
  if (ansattParam   !== "alle") aktiveBadger.push({ label: ansattLabel(ansattParam), key: "ansatt" });

  // ── Tildeling ──
  const openAssign = (row: CaseRow) =>
    setAssignDialog({ open: true, row, selected: row.employeeId ?? undefined });

  const confirmAssign = () => {
    const { row, selected } = assignDialog;
    if (!row) return;
    const newId = !selected || selected === "ikke-tildelt" ? null : selected;
    setCases((prev) =>
      prev.map((c) => (c.id === row.id ? { ...c, employeeId: newId } : c)),
    );
    toast({
      title: "Sak tildelt",
      description: `${row.id} → ${newId ? employeeName(newId) : "Ikke tildelt"}`,
    });
    setAssignDialog({ open: false });
  };

  // ── Tittel basert på aktive filtre ──
  const panelTittel = harAktiveFiltre
    ? aktiveBadger.map((b) => b.label).join(" · ")
    : "Alle saker";

  return (
    <div className="space-y-4">

      {/* ── Filterrad ── */}
      <div className="flex flex-wrap items-end gap-4 rounded-sm border border-border bg-card px-4 py-3">
        <Select
          label="Status"
          value={statusParam}
          onChange={(e) => setParam("status", e.target.value)}
          size="small"
          className="w-52"
        >
          <option value="alle">Alle statuser</option>
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          label="Sakstype"
          value={kategoriParam}
          onChange={(e) => setParam("kategori", e.target.value)}
          size="small"
          className="w-52"
        >
          <option value="alle">Alle sakstyper</option>
          {CASE_CATEGORIES.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>

        <Select
          label="Saksbehandler"
          value={ansattParam}
          onChange={(e) => setParam("ansatt", e.target.value)}
          size="small"
          className="w-56"
        >
          <option value="alle">Alle saksbehandlere</option>
          <option value="ikke-tildelt">Ikke tildelt</option>
          {EMPLOYEES.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>

        <div className="ml-auto flex items-center gap-3">
          {harAktiveFiltre && (
            <button
              onClick={nullstillAlle}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
              Nullstill filtre
            </button>
          )}
          <BodyShort size="small" className="text-muted-foreground">
            Viser{" "}
            <span className="font-semibold text-foreground">{filteredCases.length}</span>{" "}
            av {cases.length} saker
          </BodyShort>
        </div>
      </div>

      {/* ── Aktive filtre som badges ── */}
      {harAktiveFiltre && (
        <HStack gap="2" align="center" wrap={false} className="flex-wrap">
          <FunnelIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          {aktiveBadger.map((b) => (
            <button
              key={b.key}
              onClick={() => setParam(b.key, "alle")}
              className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-secondary px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-secondary/60"
              aria-label={`Fjern filter: ${b.label}`}
            >
              {b.label}
              <XMarkIcon className="h-3 w-3" aria-hidden />
            </button>
          ))}
        </HStack>
      )}

      {/* ── Saksliste ── */}
      <Panel
        title={panelTittel}
        description={
          harAktiveFiltre
            ? `${filteredCases.length} saker matcher valgte filtre`
            : `${filteredCases.length} saker totalt`
        }
        contentClassName="p-0"
      >
        <CaseTable
          rows={filteredCases}
          hideEmployee={ansattParam !== "alle" && ansattParam !== "ikke-tildelt"}
          onAssign={openAssign}
          emptyText="Ingen saker matcher valgte filtre."
        />
      </Panel>

      {/* ── Tildelingsmodal ── */}
      <Modal
        open={assignDialog.open}
        onClose={() => setAssignDialog((prev) => ({ ...prev, open: false }))}
        header={{ heading: "Tildel saksbehandler", closeButton: true }}
      >
        <Modal.Body>
          <p className="mb-4 text-sm text-muted-foreground">
            Sak <span className="font-mono">{assignDialog.row?.id}</span> –{" "}
            {assignDialog.row?.category}
          </p>
          <Select
            label="Saksbehandler"
            value={assignDialog.selected ?? "ikke-tildelt"}
            onChange={(e) =>
              setAssignDialog((prev) => ({ ...prev, selected: e.target.value }))
            }
          >
            <option value="ikke-tildelt">Ikke tildelt</option>
            {EMPLOYEES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.unit}
              </option>
            ))}
          </Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={confirmAssign}>
            Lagre tildeling
          </Button>
          <Button variant="secondary" onClick={() => setAssignDialog({ open: false })}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Saksoversikt;
