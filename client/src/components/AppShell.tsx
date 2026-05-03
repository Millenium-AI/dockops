import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="grid h-dvh w-full"
      style={{ gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr" }}
    >
      <div className="row-span-2">
        <Sidebar />
      </div>

      <header className="h-[60px] border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-6">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </header>

      <main className="overflow-y-auto scroll-contain bg-background">
        {children}
      </main>
    </div>
  );
}
