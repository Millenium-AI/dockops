import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CalendarRange, BarChart3, Wrench, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";

const NAV = [
  { href: "/",          label: "Board",     icon: LayoutDashboard },
  { href: "/schedule",  label: "Schedule",  icon: CalendarRange },
  { href: "/reporting", label: "Reports",   icon: BarChart3 },
];

export function Sidebar() {
  const [loc] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1024) setCollapsed(true);
      else if (w >= 1280) setCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = collapsed
    ? "clamp(44px, 3.5vw, 56px)"
    : "clamp(180px, 14vw, 240px)";

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="grid grid-rows-[auto_1fr_auto] bg-card border-r border-border h-full shrink-0"
        style={{
          width,
          transition: "width 200ms ease",
          "--sidebar-w": width,
        } as React.CSSProperties}
      >
        {/* Brand */}
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <Link href="/" className={`flex items-center gap-2.5 group ${collapsed ? "justify-center px-0" : ""}`}>
            <div className="grid place-items-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20 shrink-0">
              <Wrench className="w-4 h-4 text-primary" strokeWidth={2.4} />
            </div>
            {!collapsed && (
              <div>
                <div className="text-base font-semibold tracking-tight leading-tight">JobTracker</div>
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80 leading-tight">
                  Work Scheduler
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? loc === "/" : loc.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      flex items-center rounded-md text-sm transition-colors h-9
                      ${collapsed ? "px-0 justify-center" : "gap-2.5 px-3"}
                      ${active
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/50"}
                    `}
                  >
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="grid place-items-center">
                            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} strokeWidth={1.8} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} strokeWidth={1.8} />
                    )}
                    {!collapsed && <span className="font-medium">{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Collapse toggle */}
          <div className="mt-4 px-1">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-full flex items-center justify-center h-8 text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded-md"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3">
          <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 grid place-items-center text-primary text-xs font-semibold shrink-0">
              NW
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="text-sm font-medium truncate">Nick — Owner</div>
                <div className="text-xs text-muted-foreground">Tampa Bay Marine</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
