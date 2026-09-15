import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CalendarRange, BarChart3, Wrench, ChevronLeft, ChevronRight, LogOut, Settings, Zap,
} from "lucide-react";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/",          label: "Board",     icon: LayoutDashboard },
  { href: "/schedule",  label: "Schedule",  icon: CalendarRange },
  { href: "/reporting", label: "Reports",   icon: BarChart3 },
];

const ADMIN_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [loc] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();

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
        className="grid grid-rows-[auto_1fr_auto] bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 h-full shrink-0"
        style={{
          width,
          transition: "width 200ms ease",
          "--sidebar-w": width,
        } as React.CSSProperties}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-800/50">
          <Link href="/" className={`flex items-center gap-3 group ${collapsed ? "justify-center px-0" : ""}`}>
            <div className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shrink-0 shadow-lg">
              <Wrench className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold text-white tracking-tight">JobTracker</div>
                <div className="text-xs text-slate-400 font-medium">Job Management</div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="overflow-y-auto px-3 py-4 space-y-1">
          <ul className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? loc === "/" : loc.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      flex items-center rounded-lg text-sm transition-all h-9
                      ${collapsed ? "px-0 justify-center" : "gap-3 px-3"}
                      ${active
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}
                    `}
                  >
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="grid place-items-center">
                            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-400" : ""}`} strokeWidth={1.8} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-400" : ""}`} strokeWidth={1.8} />
                    )}
                    {!collapsed && <span className="font-medium">{label}</span>}
                  </Link>
                </li>
              );
            })}

            {/* Admin nav - only show if user is admin */}
            {isAdmin && (
              <>
                <li className="pt-3 mt-3 border-t border-slate-800/50">
                  <div className={`text-xs font-bold tracking-wider text-slate-500 px-3 py-2 uppercase ${collapsed ? "hidden" : ""}`}>
                    Settings
                  </div>
                </li>
                {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                  const active = loc.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`
                          flex items-center rounded-lg text-sm transition-all h-9
                          ${collapsed ? "px-0 justify-center" : "gap-3 px-3"}
                          ${active
                            ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}
                        `}
                      >
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="grid place-items-center">
                                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-400" : ""}`} strokeWidth={1.8} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-400" : ""}`} strokeWidth={1.8} />
                        )}
                        {!collapsed && <span className="font-medium">{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
          </ul>

          {/* Collapse toggle */}
          <div className="mt-4 px-1">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-full flex items-center justify-center h-8 text-slate-600 hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-800/50"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800/50 px-3 py-4">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className={`w-full flex items-center rounded-lg text-sm transition-all h-9 text-slate-400 hover:text-red-300 hover:bg-red-600/10 ${
              collapsed ? "px-0 justify-center" : "gap-3 px-3"
            }`}
            title="Logout"
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                <span className="font-medium text-sm">Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
