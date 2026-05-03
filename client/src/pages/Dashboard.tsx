import { AppShell } from "@/components/AppShell";
import { StatCard, SectionHeader, StatusBadge, Pill, Sparkline, EmptyState } from "@/components/ui-kit";
import {
  getFinanceSnapshot, getAlerts, todaysFollowUps, jobsAtRisk,
  permitsInQueue, depositsNotReceived, jobsStartingThisWeek,
  jobsFinishingThisWeek, completedAwaitingFinal, dollars, fmtRelative, fmtDate, diffDays,
} from "@/data/selectors";
import { Link } from "wouter";
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, Banknote, CalendarClock,
  CircleDollarSign, FileWarning, Flame, Gauge, Hourglass, Sun, Waves, Wind,
} from "lucide-react";
import { PERMIT_STATUS_LABEL } from "@/data/types";
import { NOW } from "@/data/seed";

export default function Dashboard() {
  const fin = getFinanceSnapshot();
  const alerts = getAlerts();
  const followUps = todaysFollowUps();
  const atRisk = jobsAtRisk();
  const permits = permitsInQueue().slice(0, 5);
  const noDep = depositsNotReceived();
  const starting = jobsStartingThisWeek();
  const finishing = jobsFinishingThisWeek();
  const finalQueue = completedAwaitingFinal();
  const today = NOW;

  // Synthetic weekly trend for the pipeline value sparkline (cosmetic, deterministic)
  const trend = [320, 348, 372, 365, 401, 398, 412, 419].map((v) => v * 1000);

  return (
    <AppShell
      title="Owner Dashboard"
      subtitle={`${today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · Tampa Bay`}
      actions={
        <div className="hidden md:flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Sun className="w-3.5 h-3.5 text-[hsl(38_92%_62%)]" />
          <span className="num-display">82°F</span>
          <span className="opacity-50">·</span>
          <Wind className="w-3.5 h-3.5" />
          <span className="num-display">8 kt SE</span>
          <span className="opacity-50">·</span>
          <Waves className="w-3.5 h-3.5 text-primary" />
          <span className="num-display">Tide 1.2 ft ↑</span>
        </div>
      }
    >
      <div className="bg-grid">
        <div className="px-6 pt-6 pb-10 max-w-[1500px] mx-auto space-y-6">
          {/* =========== Morning briefing strip =========== */}
          <MorningBriefing
            atRiskCount={atRisk.filter((j) => j.health === "at_risk").length}
            permitCount={permits.length}
            depositCount={noDep.length}
            startCount={starting.length}
            finishCount={finishing.length}
          />

          {/* =========== KPI ROW =========== */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Sales Pipeline"
              value={dollars(fin.pipelineValue, { compact: true })}
              sub={<>Weighted {dollars(fin.weightedPipeline, { compact: true })}</>}
              hint={<><ArrowUpRight className="w-3 h-3 inline -mt-0.5" /> +6.2% wk</>}
              accent="good"
              icon={<Gauge className="w-4 h-4" strokeWidth={1.7} />}
            />
            <StatCard
              label="Sold Backlog"
              value={dollars(fin.soldBacklog, { compact: true })}
              sub="Remaining on active jobs"
              icon={<BadgeCheck className="w-4 h-4" strokeWidth={1.7} />}
            />
            <StatCard
              label="A/R Outstanding"
              value={dollars(fin.arOutstanding, { compact: true })}
              sub={<>Finals unpaid {dollars(fin.finalsUnpaid, { compact: true })}</>}
              accent={fin.finalsUnpaid > 0 ? "warn" : "default"}
              icon={<CircleDollarSign className="w-4 h-4" strokeWidth={1.7} />}
            />
            <StatCard
              label="Win Rate"
              value={`${fin.winRate.toFixed(0)}%`}
              sub={<>Avg job {dollars(fin.avgJobSize, { compact: true })}</>}
              icon={<Flame className="w-4 h-4" strokeWidth={1.7} />}
            />
          </section>

          {/* =========== Pipeline strip (mini chart + counts) =========== */}
          <section className="bg-card border border-card-border rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium">8-week pipeline trend</div>
                <div className="mt-2 num-display text-3xl font-semibold leading-none">
                  {dollars(fin.pipelineValue, { compact: true })}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Open value across {Object.keys(fin).length > 0 ? "open" : ""} leads · {dollars(fin.weightedPipeline, { compact: true })} weighted
                </div>
                <Sparkline
                  values={trend}
                  className="mt-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 content-center">
                <MiniMetric label="Deposits collected" value={dollars(fin.depositsCollected, { compact: true })} accent="good" />
                <MiniMetric label="Deposits outstanding" value={dollars(fin.outstandingDeposits, { compact: true })} accent={fin.outstandingDeposits ? "warn" : "default"} />
                <MiniMetric label="Change orders" value={dollars(fin.changeOrderValue, { compact: true })} />
                <MiniMetric label="Ready to invoice" value={`${fin.jobsReadyToInvoice} job${fin.jobsReadyToInvoice === 1 ? "" : "s"}`} />
              </div>

              <div className="grid grid-cols-3 gap-3 content-center">
                <MiniMetric label="30d revenue" value={dollars(fin.fc30, { compact: true })} accent="good" />
                <MiniMetric label="60d revenue" value={dollars(fin.fc60, { compact: true })} />
                <MiniMetric label="90d revenue" value={dollars(fin.fc90, { compact: true })} />
              </div>
            </div>
          </section>

          {/* =========== TWO-COLUMN: alerts + follow-ups =========== */}
          <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[hsl(0_80%_65%)]" />
                    Urgent alerts
                  </span>
                }
                hint={`${alerts.length} active across leads, projects, permits, invoices`}
              />
              {alerts.length === 0 ? (
                <EmptyState title="All clear" hint="No urgent flags right now." />
              ) : (
                <ul className="divide-y divide-border">
                  {alerts.slice(0, 8).map((a) => (
                    <li key={a.id} className="py-2.5 flex items-start gap-3">
                      <StatusBadge kind={a.severity === "danger" ? "risk" : a.severity === "warn" ? "watch" : "info"} className="mt-0.5">
                        {a.severity === "danger" ? "Danger" : a.severity === "warn" ? "Watch" : "Info"}
                      </StatusBadge>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium leading-tight">{a.title}</div>
                        <div className="text-[12px] text-muted-foreground leading-tight mt-0.5 truncate">
                          {a.detail}
                        </div>
                      </div>
                      <Link
                        href={refLink(a.refType, a.refId)}
                        className="text-[11.5px] text-primary/80 hover:text-primary whitespace-nowrap"
                        data-testid={`link-alert-${a.id}`}
                      >
                        Review →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title="Today's follow-ups"
                hint={`${followUps.length} touchpoints due in the next 48h`}
              />
              {followUps.length === 0 ? (
                <EmptyState title="No follow-ups today" />
              ) : (
                <ul className="divide-y divide-border">
                  {followUps.slice(0, 7).map((l) => {
                    const d = diffDays(l.nextActionDate!);
                    const overdue = d < 0;
                    return (
                      <li key={l.id} className="py-2.5 flex items-center gap-3" data-testid={`row-followup-${l.id}`}>
                        <div className={`w-1 h-9 rounded-full ${overdue ? "bg-[hsl(0_80%_65%)]" : "bg-primary/70"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium leading-tight truncate">{l.customer}</div>
                          <div className="text-[12px] text-muted-foreground leading-tight mt-0.5 truncate">
                            {l.nextActionNote}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-[11.5px] num-display font-medium ${overdue ? "text-[hsl(0_80%_65%)]" : ""}`}>
                            {fmtRelative(l.nextActionDate!)}
                          </div>
                          <div className="text-[10.5px] text-muted-foreground num-display">
                            {dollars(l.estimatedValue, { compact: true })}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* =========== THREE-COLUMN: jobs at risk / permits / deposits =========== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={<span className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[hsl(0_80%_65%)]" />Jobs at risk</span>}
                hint={`${atRisk.length} flagged`}
              />
              {atRisk.length === 0 ? (
                <EmptyState title="All projects on track" />
              ) : (
                <ul className="space-y-2">
                  {atRisk.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-center gap-3 p-2 -mx-2 rounded hover-elevate">
                      <StatusBadge kind={p.health === "at_risk" ? "risk" : "watch"}>
                        {p.health === "at_risk" ? "At Risk" : "Watch"}
                      </StatusBadge>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium leading-tight truncate">
                          {p.jobNumber} · {p.customer}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                          {p.blockingIssue ?? p.scopeSummary}
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] text-muted-foreground num-display shrink-0">
                        {p.daysInStage}d
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={<span className="flex items-center gap-2"><FileWarning className="w-3.5 h-3.5 text-[hsl(38_92%_62%)]" />Permits in queue</span>}
                hint={`${permitsInQueue().length} open`}
              />
              {permits.length === 0 ? (
                <EmptyState title="No active permits" />
              ) : (
                <ul className="space-y-2">
                  {permits.map((pr) => (
                    <li key={pr.id} className="flex items-center gap-3 p-2 -mx-2 rounded hover-elevate">
                      <Pill>{pr.agency}</Pill>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate leading-tight">
                          {pr.permitType}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                          {PERMIT_STATUS_LABEL[pr.status]} · {pr.jurisdiction}
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] text-muted-foreground num-display shrink-0">
                        {pr.ageDays}d
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={<span className="flex items-center gap-2"><Banknote className="w-3.5 h-3.5 text-[hsl(0_80%_65%)]" />Deposits not received</span>}
                hint={`${noDep.length} sold jobs awaiting payment`}
              />
              {noDep.length === 0 ? (
                <EmptyState title="All deposits in" />
              ) : (
                <ul className="space-y-2">
                  {noDep.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 p-2 -mx-2 rounded hover-elevate">
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(0_80%_65%)]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate leading-tight">
                          {p.jobNumber} · {p.customer}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                          {p.depositStatus.replace(/_/g, " ")} · {dollars(p.depositAmount)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* =========== TWO-COLUMN: starting / finishing =========== */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={<span className="flex items-center gap-2"><CalendarClock className="w-3.5 h-3.5 text-primary" />Jobs starting this week</span>}
                hint={`${starting.length} scheduled`}
              />
              {starting.length === 0 ? <EmptyState title="No starts this week" /> : (
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                      <th className="py-2 font-medium">Job</th>
                      <th className="py-2 font-medium">Customer</th>
                      <th className="py-2 font-medium">Crew</th>
                      <th className="py-2 font-medium text-right">Start</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {starting.slice(0, 6).map((p) => (
                      <tr key={p.id} className="hover-elevate">
                        <td className="py-2 num-display">{p.jobNumber}</td>
                        <td className="py-2">{p.customer}</td>
                        <td className="py-2 text-muted-foreground">{p.crewId ? p.crewId.replace("crew-", "Crew ").toUpperCase() : "—"}</td>
                        <td className="py-2 text-right num-display">{fmtRelative(p.scheduledStart!)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-card border border-card-border rounded-lg p-5">
              <SectionHeader
                title={<span className="flex items-center gap-2"><Hourglass className="w-3.5 h-3.5 text-primary" />Jobs finishing this week</span>}
                hint={`${finishing.length} closing out · ${finalQueue.length} ready to invoice`}
              />
              {finishing.length === 0 ? <EmptyState title="No completions this week" /> : (
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                      <th className="py-2 font-medium">Job</th>
                      <th className="py-2 font-medium">Customer</th>
                      <th className="py-2 font-medium">Stage</th>
                      <th className="py-2 font-medium text-right">Finish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {finishing.slice(0, 6).map((p) => (
                      <tr key={p.id} className="hover-elevate">
                        <td className="py-2 num-display">{p.jobNumber}</td>
                        <td className="py-2">{p.customer}</td>
                        <td className="py-2 text-muted-foreground capitalize">{p.stage.replace(/_/g, " ")}</td>
                        <td className="py-2 text-right num-display">{fmtRelative(p.forecastCompletion!)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function MiniMetric({
  label, value, accent,
}: {
  label: string;
  value: string;
  accent?: "default" | "good" | "warn" | "bad";
}) {
  const cls =
    accent === "good" ? "text-[hsl(174_58%_60%)]"
    : accent === "warn" ? "text-[hsl(38_92%_62%)]"
    : accent === "bad" ? "text-[hsl(0_80%_65%)]"
    : "";
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/90 font-medium">{label}</div>
      <div className={`mt-1.5 text-[18px] font-semibold num-display leading-none ${cls}`}>{value}</div>
    </div>
  );
}

function MorningBriefing({
  atRiskCount, permitCount, depositCount, startCount, finishCount,
}: {
  atRiskCount: number;
  permitCount: number;
  depositCount: number;
  startCount: number;
  finishCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-card border border-card-border rounded-lg p-5">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-primary font-semibold">Owner Briefing</span>
            <span className="text-[10.5px] text-muted-foreground">{NOW.toLocaleDateString("en-US", { weekday: "long" })}</span>
          </div>
          <p className="mt-2 text-[14px] leading-snug max-w-3xl">
            <span className="font-semibold">{startCount} {startCount === 1 ? "job starts" : "jobs start"} this week</span> and{" "}
            <span className="font-semibold">{finishCount} {finishCount === 1 ? "is" : "are"} wrapping up</span>.{" "}
            <span className="text-[hsl(0_80%_70%)] font-medium">{atRiskCount} project{atRiskCount === 1 ? "" : "s"} flagged at risk</span>,{" "}
            <span className="text-[hsl(38_92%_62%)] font-medium">{permitCount} permit{permitCount === 1 ? "" : "s"} stuck in queue</span>, and{" "}
            <span className="text-[hsl(0_80%_70%)] font-medium">{depositCount} deposit{depositCount === 1 ? "" : "s"} still uncollected</span>.
            Tide and weather are favorable through Wednesday.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Pill className="bg-primary/10 border-primary/30 text-primary">Crew B: mobilized · Sanderson</Pill>
          <Pill>Crew A: Ekberg pier</Pill>
          <Pill>Barge 22 free</Pill>
        </div>
      </div>
    </section>
  );
}

function refLink(type: "lead" | "project" | "permit" | "invoice", id: string): string {
  switch (type) {
    case "lead": return `/sales?lead=${id}`;
    case "project": return `/projects?p=${id}`;
    case "permit": return `/permits?id=${id}`;
    case "invoice": return `/finance?inv=${id}`;
  }
}
