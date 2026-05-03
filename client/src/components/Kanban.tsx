// Generic pure-display kanban scaffold.
import { ReactNode } from "react";

export function KanbanBoard({ children, columns }: { children?: ReactNode; columns: number }) {
  return (
    <div className="overflow-x-auto scroll-contain pb-4">
      <div
        className="grid gap-3 px-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(280px, 1fr))`, minWidth: `${columns * 280}px` }}
      >
        {children}
      </div>
    </div>
  );
}

export function KanbanColumn({
  label, count, value, accent, children,
}: {
  label: string;
  count: number;
  value?: string;
  accent?: "default" | "won" | "lost" | "build";
  children: ReactNode;
}) {
  const accentBar =
    accent === "won" ? "bg-[hsl(174_58%_55%)]"
    : accent === "lost" ? "bg-[hsl(215_18%_45%)]"
    : accent === "build" ? "bg-[hsl(38_92%_60%)]"
    : "bg-primary/60";
  return (
    <div className="flex flex-col rounded-lg bg-sidebar/40 border border-sidebar-border min-h-[300px]">
      <div className="px-3 pt-2.5 pb-2 sticky top-0 bg-sidebar/95 backdrop-blur z-[1] rounded-t-lg border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className={`block w-1 h-3.5 rounded-sm ${accentBar}`} />
          <span className="text-[11.5px] font-semibold tracking-tight">{label}</span>
          <span className="ml-auto text-[10.5px] text-muted-foreground num-display">{count}</span>
        </div>
        {value && <div className="text-[10.5px] text-muted-foreground num-display mt-0.5 ml-3">{value}</div>}
      </div>
      <div className="px-2 py-2 space-y-2 flex-1">
        {children}
      </div>
    </div>
  );
}
