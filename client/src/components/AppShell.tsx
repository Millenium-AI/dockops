import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  noPadding = false,
  fluid = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  noPadding?: boolean;
  fluid?: boolean;
}) {
  return (
    <div
      className="grid h-dvh w-full"
      style={{ gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr" }}
    >
      <div className="row-span-2">
        <Sidebar />
      </div>

      <header className="h-[clamp(48px,5vh,64px)] border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground leading-tight mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      <main
        className={`
          overflow-y-auto scroll-contain bg-background w-full
          ${noPadding ? "" : "px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)]"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
