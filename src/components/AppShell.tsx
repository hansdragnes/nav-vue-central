import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChartIcon, FolderIcon, CogIcon, QuestionmarkCircleIcon } from "@navikt/aksel-icons";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashbord", icon: BarChartIcon, end: true },
  { to: "/dashboard2", label: "Dashbord 2", icon: BarChartIcon },
  { to: "/leder", label: "Lederdashbord", icon: BarChartIcon },
  { to: "/saksoversikt", label: "Saksoversikt", icon: FolderIcon },
];

const titleMap: Record<string, { title: string; sub: string }> = {
  "/": {
    title: "Lederdashbord",
    sub: "Oversikt over saker, status og ansatte i din enhet",
  },
  "/dashboard2": {
    title: "Lederdashbord 2",
    sub: "Utvidet oversikt med nøkkeltall og fristoppfølging",
  },
  "/leder": {
    title: "Lederflate",
    sub: "Porteføljeoversikt inspirert av Watson Sak",
  },
  "/saksoversikt": {
    title: "Saksoversikt",
    sub: "Alle saker med mulighet for filtrering og tildeling",
  },
};

export const AppShell = () => {
  const location = useLocation();
  const meta = titleMap[location.pathname] ?? titleMap["/"];

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-12 items-center justify-center rounded-sm bg-destructive text-[13px] font-bold tracking-tight text-destructive-foreground">
            NAV
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Kontroll</span>
            <span className="text-[11px] text-sidebar-foreground/70">Lederflate</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent/60">
            <CogIcon className="h-4 w-4" aria-hidden />
            Innstillinger
          </button>
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent/60">
            <QuestionmarkCircleIcon className="h-4 w-4" aria-hidden />
            Hjelp
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">{meta.title}</h1>
            <p className="truncate text-sm text-muted-foreground">{meta.sub}</p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              IH
            </div>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-sm font-semibold text-foreground">Ingrid Haug</div>
              <div className="text-xs text-muted-foreground">Avdelingsleder · Kontroll Øst</div>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
