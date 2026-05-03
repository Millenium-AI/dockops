import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PROJECTS, LEADS } from "@/data/seed";
import { dollars, fmtRelative, fmtDate, getCrew } from "@/data/selectors";
import { DOCK_TYPE_LABEL, PROJECT_STAGES } from "@/data/types";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { StatusBadge, Pill, SectionHeader } from "@/components/ui-kit";
import { Search, MapPin, Phone, Mail } from "lucide-react";

export default function Customers() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Combined customer list (won projects + active projects)
  const customers = useMemo(() => {
    return PROJECTS.map((p) => ({
      id: p.id,
      jobNumber: p.jobNumber,
      customer: p.customer,
      address: p.address,
      city: p.city,
      phone: p.phone,
      email: p.email,
      contractAmount: p.contractAmount,
      stage: p.stage,
      health: p.health,
      forecastCompletion: p.forecastCompletion,
      crewId: p.crewId,
      dockType: p.dockType,
    }));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.customer.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.jobNumber.toLowerCase().includes(q),
    );
  }, [query, customers]);

  const open = PROJECTS.find((p) => p.id === openId) ?? null;

  return (
    <AppShell
      title="Customers & Jobs"
      subtitle="Searchable record of every active and completed dock project · click any row to inspect tabs"
      actions={
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, jobs, addresses…"
            className="h-8 w-[300px] pl-7 pr-2 text-[12.5px] rounded-md border border-border bg-card placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60"
            data-testid="input-search-customers"
          />
        </div>
      }
    >
      <div className="px-6 py-6 max-w-[1500px] mx-auto">
        <section className="bg-card border border-card-border rounded-lg overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-card z-[1]">
              <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                <th className="py-3 px-4 font-medium">Job</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Property</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Stage</th>
                <th className="py-3 px-4 font-medium">Health</th>
                <th className="py-3 px-4 font-medium">Crew</th>
                <th className="py-3 px-4 font-medium text-right">Contract</th>
                <th className="py-3 px-4 font-medium text-right">Finish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">No customers match.</td></tr>
              ) : filtered.map((c) => {
                const stage = PROJECT_STAGES.find((s) => s.id === c.stage);
                const crew = getCrew(c.crewId);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    className="hover-elevate cursor-pointer"
                    data-testid={`row-customer-${c.id}`}
                  >
                    <td className="py-3 px-4 num-display font-semibold">{c.jobNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.customer}</div>
                      <div className="text-[10.5px] text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {c.address}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground/80 mt-0.5">{c.city}</div>
                    </td>
                    <td className="py-3 px-4"><Pill>{DOCK_TYPE_LABEL[c.dockType]}</Pill></td>
                    <td className="py-3 px-4"><Pill>{stage?.label}</Pill></td>
                    <td className="py-3 px-4">
                      <StatusBadge kind={c.health === "at_risk" ? "risk" : c.health === "watch" ? "watch" : "track"}>
                        {c.health === "at_risk" ? "At Risk" : c.health === "watch" ? "Watch" : "On Track"}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{crew?.name.split(" — ")[0] ?? "—"}</td>
                    <td className="py-3 px-4 text-right num-display">{dollars(c.contractAmount, { compact: true })}</td>
                    <td className="py-3 px-4 text-right num-display">{fmtRelative(c.forecastCompletion)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      <ProjectDrawer project={open} onClose={() => setOpenId(null)} />
    </AppShell>
  );
}
