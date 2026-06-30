import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, CalendarRange, Anchor,
} from "lucide-react";

const NAV = [
  { href: "/",          label: "Board",     icon: LayoutDashboard },
  { href: "/schedule",  label: "Schedule",  icon: CalendarRange },
  { href: "/customers", label: "Customers", icon: Users },
];

export function Sidebar() {
  const [loc] = useLocation();
  return (
    <aside className="grid grid-rows-[auto_1fr_auto] bg-sidebar border-r border-sidebar-border w-[220px] h-full">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 group">
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
      <nav className="overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? loc === "/" : loc.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-2.5 px-3 h-9 rounded-md text-[13px] transition-colors
                    ${active
                      ? "bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50"}
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} strokeWidth={1.8} />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
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
