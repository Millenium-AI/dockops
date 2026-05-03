import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, HardHat, FileCheck2, CalendarRange,
  FolderKanban, DollarSign, Anchor, Wrench,
} from "lucide-react";

const NAV = [
  { href: "/",              label: "Dashboard",   icon: LayoutDashboard },
  { href: "/sales",         label: "Sales",       icon: Users },
  { href: "/projects",      label: "Projects",    icon: HardHat },
  { href: "/permits",       label: "Permits",     icon: FileCheck2 },
  { href: "/schedule",      label: "Schedule",    icon: CalendarRange },
  { href: "/customers",     label: "Customers",   icon: FolderKanban },
  { href: "/finance",       label: "Finance",     icon: DollarSign },
];

export function Sidebar() {
  const [loc] = useLocation();
  return (
    <aside className="grid grid-rows-[auto_1fr_auto] bg-sidebar border-r border-sidebar-border w-[230px] h-full">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-home">
          <div className="grid place-items-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
            <Anchor className="w-4 h-4 text-primary" strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight leading-tight">DockOps</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 leading-tight">
              Marine Ops
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="overflow-y-auto scroll-contain px-3 py-3">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? loc === "/" : loc.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={`
                    flex items-center gap-2.5 px-3 h-9 rounded-md text-[13px]
                    transition-colors hover-elevate
                    ${active
                      ? "bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
                      : "text-sidebar-foreground/75"}
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} strokeWidth={1.8} />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-2 pt-6 pb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Resources
        </div>
        <ul className="space-y-0.5">
          <li>
            <div
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-sidebar-foreground/55 cursor-default"
              title="Visible inside the Schedule page"
            >
              <Wrench className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span className="font-medium leading-tight">Crews &amp; Equipment</span>
            </div>
            <div className="px-3 pb-1 -mt-1 text-[10px] text-muted-foreground/55 tracking-wide">
              Inside Schedule
            </div>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 grid place-items-center text-primary text-[11px] font-semibold">
            NW
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-medium">Nick — Owner</div>
            <div className="text-[10px] text-muted-foreground">Tampa Bay Marine</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
