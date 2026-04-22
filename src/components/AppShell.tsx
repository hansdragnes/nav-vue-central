import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  UserCheck,
  Bell,
  BarChart3,
  Search,
  HelpCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashbord", icon: LayoutDashboard, end: true },
  { to: "/saksflyt", label: "Saksflyt", icon: GitBranch },
  { to: "/fordeling", label: "Fordeling", icon: Users },
  { to: "/oppfolging", label: "Medarbeideroppfølging", icon: UserCheck },
  { to: "/varsler", label: "Varsler", icon: Bell, badge: 4 },
  { to: "/statistikk", label: "Statistikk", icon: BarChart3 },
];

const titleMap: Record<string, { title: string; sub: string }> = {
  "/": { title: "Lederdashbord", sub: "Sanntidsoversikt over produksjon, restanser og frister" },
  "/saksflyt": { title: "Saksflyt og porteføljeoversikt", sub: "Hvor i verdikjeden befinner sakene seg" },
  "/fordeling": { title: "Planlegging og saksfordeling", sub: "Fordel saker basert på kapasitet, kompetanse og frist" },
  "/oppfolging": { title: "Medarbeideroppfølging", sub: "Produksjon, behandlingstid og dialoggrunnlag" },
  "/varsler": { title: "Varsler og automatisering", sub: "Frister, ventestatus og hendelser fra NAY/NFP" },
  "/statistikk": { title: "Statistikk og styringsinformasjon", sub: "Operativ styring, VPL og tertialrapportering" },
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
                      "group flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-sm bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent/60">
            <Settings className="h-4 w-4" />
            Innstillinger
          </button>
          <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent/60">
            <HelpCircle className="h-4 w-4" />
            Hjelp
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">{meta.title}</h1>
            <p className="truncate text-sm text-muted-foreground">{meta.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Søk etter sak, person eller enhet…"
                className="h-10 w-80 rounded-sm border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
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
