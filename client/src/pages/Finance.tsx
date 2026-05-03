import { AppShell } from "@/components/AppShell";
import { INVOICES, PROJECTS } from "@/data/seed";
import { getFinanceSnapshot, dollars, fmtDate, fmtRelative } from "@/data/selectors";
import { StatusBadge, Pill, StatCard, SectionHeader } from "@/components/ui-kit";
import { CircleDollarSign, Banknote, Receipt, ArrowUpRight, FileCheck2, AlertTriangle } from "lucide-react";

export default function Finance() {
  const fin = getFinanceSnapshot();

  const open = INVOICES.filter((i) => i.status === "sent" || i.status === "overdue");
  const overdue = INVOICES.filter((i) => i.status === "overdue");
  const finals = INVOICES.filter((i) => i.type === "final");

  const readyToInvoice = PROJECTS.filter(
    (p) => p.stage === "punch_list" || p.stage === "final_inspection" || p.stage === "final_invoice",
  );

  return (
    <AppShell
      title="Finance Snapshot"
      subtitle="Pipeline · backlog · A/R · invoice queue · revenue forecast"
    >
      <div className="px-6 py-6 space-y-5 max-w-[1500px] mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Pipeline" value={dollars(fin.pipelineValue, { compact: true })} sub="Open lead value" accent="good" icon={<CircleDollarSign className="w-4 h-4" />} />
          <StatCard label="Weighted Pipeline" value={dollars(fin.weightedPipeline, { compact: true })} sub="By close probability" />
          <StatCard label="Sold Backlog" value={dollars(fin.soldBacklog, { compact: true })} sub="Remaining on active jobs" />
          <StatCard label="A/R Outstanding" value={dollars(fin.arOutstanding, { compact: true })} sub={`${open.length} open invoices`} accent={overdue.length ? "warn" : "default"} />
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Deposits Collected" value={dollars(fin.depositsCollected, { compact: true })} sub="YTD" accent="good" icon={<Banknote className="w-4 h-4" />} />
          <StatCard label="Outstanding Deposits" value={dollars(fin.outstandingDeposits, { compact: true })} sub="Awaiting payment" accent={fin.outstandingDeposits ? "bad" : "default"} />
          <StatCard label="Finals Unpaid" value={dollars(fin.finalsUnpaid, { compact: true })} sub={`${finals.filter(f => f.status !== "paid").length} invoices`} accent={fin.finalsUnpaid ? "warn" : "default"} />
          <StatCard label="Change Order Value" value={dollars(fin.changeOrderValue, { compact: true })} sub="Issued" />
        </section>

        <section className="bg-card border border-card-border rounded-lg p-5">
          <SectionHeader title="Revenue forecast" hint="Projected closeouts · revenue recognition windows" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Next 30 days", v: fin.fc30, accent: "text-[hsl(174_58%_60%)]" },
              { label: "Next 60 days", v: fin.fc60, accent: "" },
              { label: "Next 90 days", v: fin.fc90, accent: "" },
            ].map((b) => (
              <div key={b.label} className="bg-background border border-border rounded-md p-4">
                <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground font-medium">{b.label}</div>
                <div className={`mt-2 text-3xl num-display font-semibold leading-none ${b.accent}`}>
                  {dollars(b.v, { compact: true })}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Forecast revenue
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-card border border-card-border rounded-lg p-5 lg:col-span-2">
            <SectionHeader
              title={<span className="flex items-center gap-2"><Receipt className="w-3.5 h-3.5 text-primary" />Open invoices</span>}
              hint={`${open.length} open · ${overdue.length} overdue`}
            />
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">Invoice</th>
                  <th className="py-2 font-medium">Job</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Due</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {open.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No open invoices.</td></tr>
                ) : open.map((inv) => {
                  const proj = PROJECTS.find((p) => p.id === inv.projectId);
                  return (
                    <tr key={inv.id} className="hover-elevate" data-testid={`row-invoice-${inv.id}`}>
                      <td className="py-2.5 num-display">{inv.id}</td>
                      <td className="py-2.5">
                        <div className="font-medium num-display">{proj?.jobNumber}</div>
                        <div className="text-[10.5px] text-muted-foreground truncate">{proj?.customer}</div>
                      </td>
                      <td className="py-2.5 capitalize">{inv.type.replace(/_/g, " ")}</td>
                      <td className="py-2.5 num-display">{fmtRelative(inv.dueDate)}</td>
                      <td className="py-2.5">
                        <StatusBadge kind={inv.status === "overdue" ? "risk" : "watch"}>
                          {inv.status}
                        </StatusBadge>
                      </td>
                      <td className="py-2.5 text-right num-display font-semibold">{dollars(inv.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-card border border-card-border rounded-lg p-5">
            <SectionHeader
              title={<span className="flex items-center gap-2"><FileCheck2 className="w-3.5 h-3.5 text-primary" />Ready to invoice</span>}
              hint={`${readyToInvoice.length} job${readyToInvoice.length === 1 ? "" : "s"} closing out`}
            />
            {readyToInvoice.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground py-4">Nothing in punch list or final inspection.</p>
            ) : (
              <ul className="divide-y divide-border">
                {readyToInvoice.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center gap-3 -mx-2 px-2 rounded hover-elevate">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{p.jobNumber} · {p.customer}</div>
                      <div className="text-[10.5px] text-muted-foreground capitalize mt-0.5">{p.stage.replace(/_/g, " ")}</div>
                    </div>
                    <div className="text-[11.5px] num-display font-semibold">{dollars(p.contractAmount, { compact: true })}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
