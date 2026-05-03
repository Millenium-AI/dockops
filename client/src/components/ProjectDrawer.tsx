import { useEffect, useState } from "react";
import {
  Project, DOCK_TYPE_LABEL, PROJECT_STAGES, PERMIT_STATUS_LABEL,
} from "@/data/types";
import {
  dollars, fmtDate, fmtRelative, getCrew, projectInvoices, projectPermit, projectScheduleItems,
} from "@/data/selectors";
import { StatusBadge, Pill, SectionHeader } from "./ui-kit";
import { Mail, Phone, MapPin, X, FileText, Wallet, Calendar, MessageSquare, Anchor, Settings2, Wrench } from "lucide-react";

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "site",      label: "Site & Scope" },
  { id: "permits",   label: "Permits" },
  { id: "schedule",  label: "Schedule" },
  { id: "payments",  label: "Payments" },
  { id: "comms",     label: "Comms" },
  { id: "closeout",  label: "Closeout" },
] as const;

type TabId = typeof TABS[number]["id"];

export function ProjectDrawer({
  project, onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => { setTab("overview"); }, [project?.id]);

  if (!project) return null;
  const stage = PROJECT_STAGES.find((s) => s.id === project.stage);
  const crew = getCrew(project.crewId);
  const invoices = projectInvoices(project.id);
  const permit = projectPermit(project.id);
  const schedule = projectScheduleItems(project.id);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-card border-l border-card-border z-40
                   flex flex-col"
        data-testid={`drawer-project-${project.id}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground num-display">
                Job {project.jobNumber} · {project.id}
              </div>
              <h2 className="mt-1 text-[18px] font-semibold leading-tight">{project.customer}</h2>
              <div className="mt-1 text-[12px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {project.address}, {project.city}
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded hover-elevate" data-testid="button-close-project-drawer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <SmallStat label="Contract" value={dollars(project.contractAmount, { compact: true })} accent="primary" />
            <SmallStat label="Deposit" value={dollars(project.depositAmount, { compact: true })}
              accent={project.depositStatus === "received" ? "good" : "bad"} />
            <SmallStat label="Forecast Done" value={fmtRelative(project.forecastCompletion)} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge kind={project.health === "at_risk" ? "risk" : project.health === "watch" ? "watch" : "track"}>
              {project.health === "at_risk" ? "At Risk" : project.health === "watch" ? "Watch" : "On Track"}
            </StatusBadge>
            <Pill>{stage?.label ?? project.stage}</Pill>
            <Pill>{DOCK_TYPE_LABEL[project.dockType]}</Pill>
            <Pill>{crew?.name ?? "No crew"}</Pill>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex items-stretch overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`
                px-3.5 h-10 text-[12px] font-medium whitespace-nowrap relative
                ${tab === t.id ? "text-foreground" : "text-muted-foreground"}
                hover-elevate
              `}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto scroll-contain flex-1 p-5 space-y-6">
          {tab === "overview" && (
            <>
              {project.blockingIssue && (
                <div className="bg-[hsl(0_80%_60%)/0.08] border border-[hsl(0_80%_60%)/0.25] rounded-md p-3">
                  <div className="text-[11px] uppercase tracking-[0.1em] text-[hsl(0_80%_75%)] font-medium">Blocker</div>
                  <div className="text-[13px] mt-1">{project.blockingIssue}</div>
                </div>
              )}
              <div>
                <SectionHeader title="Scope" />
                <p className="text-[13px] text-muted-foreground leading-relaxed">{project.scopeSummary}</p>
              </div>
              <Grid>
                <KV label="Project Manager" v={project.projectManager} />
                <KV label="Crew" v={crew?.name ?? "—"} />
                <KV label="Margin" v={`${project.marginEstimate}%`} />
                <KV label="Cost to date" v={dollars(project.actualCostToDate)} />
                <KV label="Change orders" v={project.changeOrderCount} />
                <KV label="Days in stage" v={`${project.daysInStage}d`} />
              </Grid>
              <div>
                <SectionHeader title="Contact" />
                <ul className="space-y-2 text-[12.5px]">
                  <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-mono text-[12px]">{project.email}</span></li>
                  <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-mono text-[12px]">{project.phone}</span></li>
                </ul>
              </div>
            </>
          )}

          {tab === "site" && (
            <>
              <div>
                <SectionHeader title="Site & Waterfront" />
                <Grid>
                  <KV label="Waterfront" v={project.waterfrontType.replace(/_/g, " ")} />
                  <KV label="Water depth" v={`${project.waterDepthFt} ft`} />
                  <KV label="Bottom" v={project.bottomType} />
                  <KV label="Access" v={project.accessDifficulty.replace(/_/g, " ")} />
                  <KV label="Existing structure" v={project.existingStructureCondition} />
                  <KV label="Weather sensitivity" v={project.weatherSensitivity} />
                  <KV label="Mobilization" v={project.mobilizationComplexity.replace(/_/g, " ")} />
                </Grid>
              </div>
              <div>
                <SectionHeader title="Materials" />
                <Grid>
                  <KV label="Pile" v={project.pileType} />
                  <KV label="Framing" v={project.framingMaterial} />
                  <KV label="Decking" v={project.deckingMaterial} />
                </Grid>
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-1.5">Accessories</div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.accessories.length === 0 ? (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    ) : project.accessories.map((a) => <Pill key={a}>{a}</Pill>)}
                  </div>
                </div>
              </div>
              <div>
                <SectionHeader title="Photos & Documents" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] bg-background border border-dashed border-border rounded-md grid place-items-center">
                      <span className="text-[11px] text-muted-foreground/70">Site photo {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "permits" && (
            permit ? (
              <>
                <Grid>
                  <KV label="Jurisdiction" v={permit.jurisdiction} />
                  <KV label="Agency" v={permit.agency} />
                  <KV label="Permit type" v={permit.permitType} />
                  <KV label="Status" v={PERMIT_STATUS_LABEL[permit.status]} />
                  <KV label="Submitted" v={fmtDate(permit.submissionDate)} />
                  <KV label="Approval target" v={fmtDate(permit.approvalTargetDate)} />
                  <KV label="Drawings" v={permit.drawingsNeeded ? "Required" : "Not needed"} />
                  <KV label="Engineering" v={permit.engineeringNeeded ? "Required" : "Not needed"} />
                  <KV label="Aging" v={`${permit.ageDays}d`} />
                </Grid>
                {permit.reviewerComments && (
                  <div className="bg-background border border-border rounded-md p-3">
                    <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">Reviewer comments</div>
                    <div className="mt-1 text-[12.5px]">{permit.reviewerComments}</div>
                  </div>
                )}
                <div>
                  <SectionHeader title="Inspection requirements" />
                  <p className="text-[12.5px] text-muted-foreground">{permit.inspectionRequirements}</p>
                </div>
              </>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">No permit record on file.</p>
            )
          )}

          {tab === "schedule" && (
            <ul className="divide-y divide-border">
              {schedule.length === 0 ? (
                <li className="py-4 text-[12.5px] text-muted-foreground">No scheduled items.</li>
              ) : schedule.map((s) => (
                <li key={s.id} className="py-2.5 flex items-start gap-3">
                  <div className="w-12 text-[11px] num-display text-muted-foreground pt-0.5">{fmtDate(s.date)}</div>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-medium leading-tight">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {s.crew ?? "—"}{s.equipment ? ` · ${s.equipment.join(", ")}` : ""}
                    </div>
                  </div>
                  {s.weatherRisk && (
                    <Pill className={
                      s.weatherRisk === "high" ? "bg-[hsl(0_80%_60%)/0.1] border-[hsl(0_80%_60%)/0.3] text-[hsl(0_80%_70%)]" :
                      s.weatherRisk === "medium" ? "bg-[hsl(38_92%_60%)/0.1] border-[hsl(38_92%_60%)/0.3] text-[hsl(38_92%_62%)]" :
                      ""
                    }>{s.weatherRisk} wx</Pill>
                  )}
                </li>
              ))}
            </ul>
          )}

          {tab === "payments" && (
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Due</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-muted-foreground">No invoices yet.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="hover-elevate">
                    <td className="py-2 capitalize">{inv.type.replace(/_/g, " ")}</td>
                    <td className="py-2 num-display">{dollars(inv.amount)}</td>
                    <td className="py-2 num-display">{fmtDate(inv.dueDate)}</td>
                    <td className="py-2">
                      <StatusBadge kind={
                        inv.status === "paid" ? "track"
                        : inv.status === "overdue" ? "risk"
                        : inv.status === "sent" ? "watch"
                        : "neutral"
                      }>{inv.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "comms" && (
            <ul className="space-y-3">
              {project.comms.length === 0 ? (
                <li className="text-[12.5px] text-muted-foreground">No communications logged.</li>
              ) : project.comms.map((c) => (
                <li key={c.id} className="bg-background border border-border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                      {c.channel} · {c.by}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground num-display">{fmtRelative(c.date)}</div>
                  </div>
                  <p className="mt-1 text-[12.5px]">{c.note}</p>
                </li>
              ))}
              <li className="pt-2">
                <textarea
                  placeholder="Log a quick note…"
                  className="w-full text-[12.5px] bg-background border border-border rounded-md p-2 resize-none placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50"
                  rows={3}
                  data-testid="textarea-log-note"
                />
              </li>
            </ul>
          )}

          {tab === "closeout" && (
            <>
              <Grid>
                <KV label="Punch list" v={project.stage === "closed" || project.stage === "final_invoice" ? "Complete" : "In progress"} />
                <KV label="Final inspection" v={project.stage === "closed" || project.stage === "final_invoice" ? "Passed" : "Pending"} />
                <KV label="Final invoice" v={invoices.find((i) => i.type === "final")?.status ?? "—"} />
                <KV label="Warranty start" v={fmtDate(project.forecastCompletion)} />
              </Grid>
              <p className="text-[12.5px] text-muted-foreground">{project.warrantyNotes ?? "Standard 1-year materials & workmanship warranty applies."}</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-end gap-2">
          <button className="px-3 h-8 text-[12px] rounded-md border border-border hover-elevate">Add note</button>
          <button className="px-3 h-8 text-[12px] rounded-md bg-primary text-primary-foreground font-medium hover-elevate">
            Update stage
          </button>
        </div>
      </aside>
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">{children}</div>;
}
function KV({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{label}</div>
      <div className="text-[12.5px] mt-0.5 capitalize">{v}</div>
    </div>
  );
}
function SmallStat({
  label, value, accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "good" | "bad";
}) {
  const cls =
    accent === "primary" ? "text-primary"
    : accent === "good" ? "text-[hsl(174_58%_60%)]"
    : accent === "bad" ? "text-[hsl(0_80%_70%)]"
    : "";
  return (
    <div className="bg-background border border-border rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{label}</div>
      <div className={`mt-1 text-[15px] font-semibold leading-none num-display ${cls}`}>{value}</div>
    </div>
  );
}
