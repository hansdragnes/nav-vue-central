// Mock data for NAV Kontroll – ledersaksoversikt
// Read-only mock for prototype.

export type CaseStatus =
  | "Ny"
  | "Under behandling"
  | "Venter på bruker"
  | "Venter på administrasjon"
  | "Venter på politi"
  | "Til godkjenning"
  | "Ferdig";

export const CASE_STATUSES: CaseStatus[] = [
  "Ny",
  "Under behandling",
  "Venter på bruker",
  "Venter på administrasjon",
  "Venter på politi",
  "Til godkjenning",
  "Ferdig",
];

export type CaseCategory =
  | "Dagpenger"
  | "AAP"
  | "Sykepenger"
  | "Foreldrepenger"
  | "Bostøtte"
  | "Uføretrygd";

export const CASE_CATEGORIES: CaseCategory[] = [
  "Dagpenger",
  "AAP",
  "Sykepenger",
  "Foreldrepenger",
  "Bostøtte",
  "Uføretrygd",
];

export interface Employee {
  id: string;
  name: string;
  unit: "Kontroll Øst" | "Kontroll Vest";
}

export interface CaseRow {
  id: string;
  category: CaseCategory;
  status: CaseStatus;
  ageDays: number;
  employeeId: string | null; // null = ikke tildelt
}

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Per Hansen", unit: "Kontroll Øst" },
  { id: "e2", name: "Marte Kristiansen", unit: "Kontroll Øst" },
  { id: "e3", name: "Lars Østby", unit: "Kontroll Øst" },
  { id: "e4", name: "Anna Berg", unit: "Kontroll Vest" },
  { id: "e5", name: "Kim Tønnesen", unit: "Kontroll Vest" },
  { id: "e6", name: "Eva Ruud", unit: "Kontroll Vest" },
  { id: "e7", name: "Jonas Lien", unit: "Kontroll Øst" },
  { id: "e8", name: "Mira Sand", unit: "Kontroll Vest" },
];

// Deterministisk pseudo-tilfeldig generator
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateCases(): CaseRow[] {
  const rng = seeded(42);
  const rows: CaseRow[] = [];
  const total = 184;
  for (let i = 0; i < total; i++) {
    const cat = CASE_CATEGORIES[Math.floor(rng() * CASE_CATEGORIES.length)];
    const statusRoll = rng();
    let status: CaseStatus;
    if (statusRoll < 0.12) status = "Ny";
    else if (statusRoll < 0.45) status = "Under behandling";
    else if (statusRoll < 0.55) status = "Venter på bruker";
    else if (statusRoll < 0.65) status = "Venter på administrasjon";
    else if (statusRoll < 0.72) status = "Venter på politi";
    else if (statusRoll < 0.8) status = "Til godkjenning";
    else status = "Ferdig";

    // Ny + ~10 % øvrige er ikke tildelt
    const unassigned = status === "Ny" || rng() < 0.05;
    const employeeId = unassigned ? null : EMPLOYEES[Math.floor(rng() * EMPLOYEES.length)].id;

    const ageDays = Math.floor(rng() * 65) + 1;
    rows.push({
      id: `K-2024-${(10000 + i).toString()}`,
      category: cat,
      status,
      ageDays,
      employeeId,
    });
  }
  return rows;
}

export const CASES: CaseRow[] = generateCases();

export function employeeName(id: string | null): string {
  if (!id) return "Ikke tildelt";
  return EMPLOYEES.find((e) => e.id === id)?.name ?? "Ukjent";
}

export const ACTIVE_STATUSES: CaseStatus[] = [
  "Ny",
  "Under behandling",
  "Venter på bruker",
  "Venter på administrasjon",
  "Venter på politi",
  "Til godkjenning",
];
