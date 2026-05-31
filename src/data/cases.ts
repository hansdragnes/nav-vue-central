// Mock data for NAV Kontroll – ledersaksoversikt
// Read-only mock for prototype.

export type CaseStatus =
  | "Ny"
  | "Utredes"
  | "Strafferettslig vurdering"
  | "Venter på forvaltning"
  | "Venter på politi"
  | "Henlagt"
  | "Avsluttet";

export const CASE_STATUSES: CaseStatus[] = [
  "Ny",
  "Utredes",
  "Strafferettslig vurdering",
  "Venter på forvaltning",
  "Venter på politi",
  "Henlagt",
  "Avsluttet",
];

export type CaseCategory =
  | "Behandler"
  | "Arbeid"
  | "Samliv"
  | "Utland"
  | "Identitet"
  | "Tiltak"
  | "Dokumentfalsk"
  | "Annet";

export const CASE_CATEGORIES: CaseCategory[] = [
  "Behandler",
  "Arbeid",
  "Samliv",
  "Utland",
  "Identitet",
  "Tiltak",
  "Dokumentfalsk",
  "Annet",
];

export type Unit = "Kontroll Øst" | "Kontroll Vest" | "Kontroll Nord" | "Analyse";

export const UNITS: Unit[] = ["Kontroll Øst", "Kontroll Vest", "Kontroll Nord", "Analyse"];

export interface Employee {
  id: string;
  name: string;
  unit: Unit;
}

export interface CaseRow {
  id: string;
  category: CaseCategory;
  status: CaseStatus;
  ageDays: number;
  createdAt: string; // ISO-dato, f.eks. "2024-03-15"
  employeeId: string | null; // null = ikke tildelt
  unit: Unit;
  belop: number | null; // Beløp stanset (kr), null hvis ikke relevant
}

// Økonomiske nøkkeltall per enhet (månedlig mock)
export interface OkonomiskNokkel {
  hoyesteBelopStanset: number;
  totaltStanset: number;
  totaltInnsparing: number;
  totaltTilbakekreving: number;
}

export const OKONOMISK_PER_ENHET: Record<Unit, OkonomiskNokkel> = {
  "Kontroll Øst":  { hoyesteBelopStanset: 1_840_000, totaltStanset: 12_350_000, totaltInnsparing: 4_720_000, totaltTilbakekreving: 2_180_000 },
  "Kontroll Vest": { hoyesteBelopStanset: 2_100_000, totaltStanset:  9_800_000, totaltInnsparing: 3_950_000, totaltTilbakekreving: 1_740_000 },
  "Kontroll Nord": { hoyesteBelopStanset:   980_000, totaltStanset:  6_200_000, totaltInnsparing: 2_310_000, totaltTilbakekreving: 1_020_000 },
  "Analyse":       { hoyesteBelopStanset:   450_000, totaltStanset:  3_100_000, totaltInnsparing: 1_640_000, totaltTilbakekreving:   580_000 },
};

// Bakoverkompatibel eksport for eksisterende kode
export const OKONOMISK: OkonomiskNokkel = OKONOMISK_PER_ENHET["Kontroll Øst"];

export const EMPLOYEES: Employee[] = [
  { id: "e1",  name: "Per Hansen",        unit: "Kontroll Øst" },
  { id: "e2",  name: "Marte Kristiansen", unit: "Kontroll Øst" },
  { id: "e3",  name: "Lars Østby",        unit: "Kontroll Øst" },
  { id: "e4",  name: "Anna Berg",         unit: "Kontroll Vest" },
  { id: "e5",  name: "Kim Tønnesen",      unit: "Kontroll Vest" },
  { id: "e6",  name: "Eva Ruud",          unit: "Kontroll Vest" },
  { id: "e7",  name: "Jonas Lien",        unit: "Kontroll Øst" },
  { id: "e8",  name: "Mira Sand",         unit: "Kontroll Vest" },
  { id: "e9",  name: "Håkon Dahl",        unit: "Kontroll Nord" },
  { id: "e10", name: "Silje Moen",        unit: "Kontroll Nord" },
  { id: "e11", name: "Tor Bakken",        unit: "Kontroll Nord" },
  { id: "e12", name: "Ingrid Vik",        unit: "Analyse" },
  { id: "e13", name: "Rune Halvorsen",    unit: "Analyse" },
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
  const total = 320;

  // Fordel saker på enheter med ulik tyngde
  const unitWeights: { unit: Unit; share: number }[] = [
    { unit: "Kontroll Øst",  share: 0.32 },
    { unit: "Kontroll Vest", share: 0.28 },
    { unit: "Kontroll Nord", share: 0.22 },
    { unit: "Analyse",       share: 0.18 },
  ];

  for (let i = 0; i < total; i++) {
    // Velg enhet basert på vekting
    const roll = rng();
    let cum = 0;
    let unit: Unit = "Kontroll Øst";
    for (const w of unitWeights) {
      cum += w.share;
      if (roll < cum) { unit = w.unit; break; }
    }

    const cat = CASE_CATEGORIES[Math.floor(rng() * CASE_CATEGORIES.length)];
    const statusRoll = rng();
    let status: CaseStatus;
    if (statusRoll < 0.12)      status = "Ny";
    else if (statusRoll < 0.32) status = "Utredes";
    else if (statusRoll < 0.45) status = "Strafferettslig vurdering";
    else if (statusRoll < 0.58) status = "Venter på forvaltning";
    else if (statusRoll < 0.65) status = "Venter på politi";
    else if (statusRoll < 0.72) status = "Henlagt";
    else                        status = "Avsluttet";

    // Ansatte i aktuell enhet
    const unitEmployees = EMPLOYEES.filter((e) => e.unit === unit);
    const unassigned = status === "Ny" || rng() < 0.05;
    const employeeId = unassigned || unitEmployees.length === 0
      ? null
      : unitEmployees[Math.floor(rng() * unitEmployees.length)].id;

    const ageDays = Math.floor(rng() * 65) + 1;
    const ref = new Date("2024-12-01");
    ref.setDate(ref.getDate() - ageDays);
    const createdAt = ref.toISOString().slice(0, 10);

    const harBelop = (status === "Avsluttet" || status === "Henlagt") && rng() > 0.5;
    const belop = harBelop ? Math.round(rng() * 1_900_000 + 50_000) : null;

    rows.push({
      id: `K-2024-${(10000 + i).toString()}`,
      category: cat,
      status,
      ageDays,
      createdAt,
      employeeId,
      unit,
      belop,
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
  "Utredes",
  "Strafferettslig vurdering",
  "Venter på forvaltning",
  "Venter på politi",
  "Henlagt",
];
