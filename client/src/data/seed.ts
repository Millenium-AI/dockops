import type {
  Lead, Project, Permit, Invoice, ScheduleItem, Crew, Equipment, ChangeOrder,
} from "./types";

// Today is fixed to a known date so demo data stays stable.
// Seed assumes "today" = 2026-05-04 (Mon). Component code reads NOW from this module.
export const NOW = new Date("2026-05-04T13:00:00-04:00");

// -------- helpers
const D = (offsetDays: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};
const day = (offsetDays: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// =====================================================================
// CREWS & EQUIPMENT
// =====================================================================
export const CREWS: Crew[] = [
  { id: "crew-a", name: "Crew A — Pilings",  lead: "Mateo Alvarez",   size: 4, specialties: ["pile driving", "framing"] },
  { id: "crew-b", name: "Crew B — Build",    lead: "Travis Whitfield", size: 5, specialties: ["framing", "decking", "lifts"] },
  { id: "crew-c", name: "Crew C — Floating", lead: "Devon Hargrave",   size: 3, specialties: ["floating systems", "gangways"] },
  { id: "crew-d", name: "Crew D — Service",  lead: "Rita Calhoun",     size: 2, specialties: ["repairs", "punch list", "lifts"] },
];

export const EQUIPMENT: Equipment[] = [
  { id: "eq-barge-1",  name: "Barge 28 — Sea Hawk",   type: "barge",       status: "in_use",      assignedProject: "P-1043" },
  { id: "eq-barge-2",  name: "Barge 22 — Tideline",   type: "barge",       status: "available" },
  { id: "eq-pd-1",     name: "Pile Driver — APE D19", type: "pile_driver", status: "in_use",      assignedProject: "P-1043" },
  { id: "eq-pd-2",     name: "Pile Driver — Diesel",  type: "pile_driver", status: "maintenance" },
  { id: "eq-crane-1",  name: "Mini Crane — Maeda",    type: "crane",       status: "in_use",      assignedProject: "P-1037" },
  { id: "eq-boat-1",   name: "Workboat — Mako 22",    type: "boat",        status: "available" },
  { id: "eq-boat-2",   name: "Workboat — Carolina",   type: "boat",        status: "in_use",      assignedProject: "P-1041" },
  { id: "eq-trail-1",  name: "Trailer — 30ft Flat",   type: "trailer",     status: "available" },
  { id: "eq-spec-1",   name: "Auger Attachment",      type: "specialty",   status: "available" },
];

// =====================================================================
// LEADS — 22 across all sales stages
// =====================================================================
export const LEADS: Lead[] = [
  {
    id: "L-2041", customer: "Hollister Residence", address: "412 Bayshore Blvd", city: "Tampa, FL",
    source: "Google Ads", dockType: "fixed_dock", scopeNote: "New 60' fixed dock, 10k boat lift",
    estimatedValue: 84500, probability: 25, lastContactDate: D(-1), nextActionDate: D(2),
    nextActionNote: "Call to confirm site visit window", owner: "Nick", temperature: "warm",
    stage: "new_lead", daysInStage: 1, daysSinceContact: 1,
    phone: "(813) 555-0142", email: "j.hollister@example.com",
    notes: "Referred by neighbor. Wants composite decking.",
  },
  {
    id: "L-2042", customer: "Petrov Marine Holdings", address: "88 Beach Dr NE", city: "St. Petersburg, FL",
    source: "Referral", dockType: "rebuild", scopeNote: "Full rebuild after 2024 storm damage",
    estimatedValue: 142000, probability: 45, lastContactDate: D(-5), nextActionDate: D(-1),
    nextActionNote: "Send revised proposal", owner: "Nick", temperature: "hot",
    stage: "proposal_sent", daysInStage: 6, daysSinceContact: 5,
    phone: "(727) 555-0188", email: "ops@petrovmarine.com",
  },
  {
    id: "L-2043", customer: "Carmichael Estate", address: "2210 Snell Isle Blvd", city: "St. Petersburg, FL",
    source: "Website", dockType: "boat_lift", scopeNote: "Add 16k 4-post lift to existing dock",
    estimatedValue: 28900, probability: 70, lastContactDate: D(-2), nextActionDate: D(0),
    nextActionNote: "Send contract for signature", owner: "Nick", temperature: "hot",
    stage: "negotiation", daysInStage: 3, daysSinceContact: 2,
    phone: "(727) 555-0211", email: "carmichael@example.com",
  },
  {
    id: "L-2044", customer: "Reyes Family", address: "1402 Riviera Dr", city: "Tampa, FL",
    source: "Houzz", dockType: "floating_dock", scopeNote: "Floating dock + gangway, fresh water canal",
    estimatedValue: 56700, probability: 50, lastContactDate: D(-3), nextActionDate: D(1),
    nextActionNote: "Confirm pricing on EZ Dock package", owner: "Nick", temperature: "warm",
    stage: "estimating", daysInStage: 4, daysSinceContact: 3,
    phone: "(813) 555-0177", email: "p.reyes@example.com",
  },
  {
    id: "L-2045", customer: "Whitman Yacht Club", address: "5500 Memorial Hwy", city: "Tampa, FL",
    source: "Cold outreach", dockType: "pier", scopeNote: "Commercial pier extension — 3 slips",
    estimatedValue: 312000, probability: 30, lastContactDate: D(-12), nextActionDate: D(-2),
    nextActionNote: "Site walk with engineer", owner: "Nick", temperature: "warm",
    stage: "site_visit_scheduled", daysInStage: 9, daysSinceContact: 12,
    phone: "(813) 555-0144", email: "ops@whitmanyc.com",
    notes: "Needs USACE input. Tidal site.",
  },
  {
    id: "L-2046", customer: "Brennan Residence", address: "3140 Beachway", city: "Clearwater, FL",
    source: "Referral", dockType: "repair", scopeNote: "Replace 8 piles, deck spot repair",
    estimatedValue: 18400, probability: 65, lastContactDate: D(-4), nextActionDate: D(2),
    nextActionNote: "Schedule install week of 5/18", owner: "Nick", temperature: "warm",
    stage: "contract_out", daysInStage: 5, daysSinceContact: 4,
    phone: "(727) 555-0233", email: "k.brennan@example.com",
  },
  {
    id: "L-2047", customer: "Aldridge Investments", address: "920 N Bayshore", city: "Safety Harbor, FL",
    source: "Google Ads", dockType: "extension", scopeNote: "Extend dock 24' to reach 4ft depth",
    estimatedValue: 36800, probability: 40, lastContactDate: D(-9), nextActionDate: null,
    nextActionNote: "", owner: "Nick", temperature: "cold",
    stage: "follow_up", daysInStage: 11, daysSinceContact: 9,
    phone: "(727) 555-0166", email: "ops@aldridge.invest",
    notes: "Has gone quiet. Last said pricing was high.",
  },
  {
    id: "L-2048", customer: "Coastal Inn Holdings", address: "201 Gulf Blvd", city: "Indian Rocks Beach, FL",
    source: "Website", dockType: "platform", scopeNote: "Observation platform + bench seating",
    estimatedValue: 41200, probability: 55, lastContactDate: D(-2), nextActionDate: D(3),
    nextActionNote: "Final scope walkthrough on-site", owner: "Nick", temperature: "warm",
    stage: "site_visit_completed", daysInStage: 2, daysSinceContact: 2,
    phone: "(727) 555-0299", email: "gm@coastalinn.example",
  },
  {
    id: "L-2049", customer: "Gallagher Residence", address: "78 Bay Pointe Dr", city: "Tampa, FL",
    source: "Referral", dockType: "fixed_dock", scopeNote: "32' walk-out, kayak launch",
    estimatedValue: 22600, probability: 60, lastContactDate: D(0), nextActionDate: D(2),
    nextActionNote: "Send proposal v2 (kayak launch added)", owner: "Nick", temperature: "hot",
    stage: "estimating", daysInStage: 1, daysSinceContact: 0,
    phone: "(813) 555-0102", email: "tom.g@example.com",
  },
  {
    id: "L-2050", customer: "Nguyen Property", address: "11 Mandalay Ave", city: "Clearwater Beach, FL",
    source: "Yelp", dockType: "seawall_adjacent", scopeNote: "Cap repair + new dock tied to seawall",
    estimatedValue: 67400, probability: 35, lastContactDate: D(-7), nextActionDate: D(-1),
    nextActionNote: "Scope walk with engineer", owner: "Nick", temperature: "warm",
    stage: "qualified", daysInStage: 3, daysSinceContact: 7,
    phone: "(727) 555-0118", email: "h.nguyen@example.com",
  },
  {
    id: "L-2051", customer: "Markham Residence", address: "601 Sailfish Dr", city: "Apollo Beach, FL",
    source: "Google Ads", dockType: "boat_lift", scopeNote: "Replace failing 10k lift",
    estimatedValue: 19800, probability: 75, lastContactDate: D(0), nextActionDate: D(1),
    nextActionNote: "Get HOA paperwork", owner: "Nick", temperature: "hot",
    stage: "deposit_received", daysInStage: 1, daysSinceContact: 0,
    phone: "(813) 555-0271", email: "markham@example.com",
  },
  {
    id: "L-2052", customer: "Vandermeer Estate", address: "9 Harbor Island", city: "Tampa, FL",
    source: "Architect", dockType: "rebuild", scopeNote: "Tear-down + premium ipe rebuild",
    estimatedValue: 198000, probability: 20, lastContactDate: D(-14), nextActionDate: null,
    nextActionNote: "", owner: "Nick", temperature: "cold",
    stage: "follow_up", daysInStage: 18, daysSinceContact: 14,
    phone: "(813) 555-0309", email: "asst@vandermeer.example",
    notes: "Owner traveling. Architect re-engaging next month.",
  },
  {
    id: "L-2053", customer: "Sharma Family", address: "402 Belleair Cswy", city: "Belleair Beach, FL",
    source: "Referral", dockType: "fixed_dock", scopeNote: "44' fixed dock with Trex decking",
    estimatedValue: 51200, probability: 30, lastContactDate: D(-3), nextActionDate: D(0),
    nextActionNote: "Schedule site visit", owner: "Nick", temperature: "warm",
    stage: "contact_attempted", daysInStage: 3, daysSinceContact: 3,
    phone: "(727) 555-0190", email: "raj.s@example.com",
  },
  {
    id: "L-2054", customer: "Holcomb Marina LLC", address: "1700 Causeway Blvd", city: "Dunedin, FL",
    source: "Industry contact", dockType: "pier", scopeNote: "Light commercial pier — 80'",
    estimatedValue: 268000, probability: 50, lastContactDate: D(-1), nextActionDate: D(4),
    nextActionNote: "Engineering review meeting", owner: "Nick", temperature: "warm",
    stage: "estimating", daysInStage: 6, daysSinceContact: 1,
    phone: "(727) 555-0444", email: "owners@holcomb.example",
  },
  {
    id: "L-2055", customer: "Beaumont Residence", address: "12 Sunset Way", city: "Treasure Island, FL",
    source: "Website", dockType: "gangway", scopeNote: "Gangway + floater for tidal access",
    estimatedValue: 47100, probability: 40, lastContactDate: D(-6), nextActionDate: D(0),
    nextActionNote: "Tide chart review with owner", owner: "Nick", temperature: "warm",
    stage: "qualified", daysInStage: 7, daysSinceContact: 6,
    phone: "(727) 555-0512", email: "beaumont@example.com",
  },
  {
    id: "L-2056", customer: "Ortiz Property", address: "55 Marina Way", city: "Madeira Beach, FL",
    source: "Drive-by", dockType: "repair", scopeNote: "Decking replacement only",
    estimatedValue: 8400, probability: 80, lastContactDate: D(0), nextActionDate: D(1),
    nextActionNote: "Send simple estimate", owner: "Nick", temperature: "hot",
    stage: "new_lead", daysInStage: 1, daysSinceContact: 0,
    phone: "(727) 555-0606", email: "ortizm@example.com",
  },
  {
    id: "L-2057", customer: "Kessler Residence", address: "7 Davis Islands", city: "Tampa, FL",
    source: "Referral", dockType: "fixed_dock", scopeNote: "L-shape dock with 13k lift",
    estimatedValue: 78900, probability: 0, lastContactDate: D(-22), nextActionDate: null,
    nextActionNote: "", owner: "Nick", temperature: "cold",
    stage: "closed_lost", daysInStage: 6, daysSinceContact: 22,
    phone: "(813) 555-0911", email: "kessler@example.com",
    notes: "Went with cheaper competitor.",
  },
  {
    id: "L-2058", customer: "Castellano Estate", address: "1414 Coral Way", city: "Tampa, FL",
    source: "Houzz", dockType: "rebuild", scopeNote: "Rebuild + add jet-ski floater",
    estimatedValue: 132500, probability: 100, lastContactDate: D(-1), nextActionDate: null,
    nextActionNote: "", owner: "Nick", temperature: "hot",
    stage: "closed_won", daysInStage: 2, daysSinceContact: 1,
    phone: "(813) 555-0850", email: "j.castellano@example.com",
  },
  {
    id: "L-2059", customer: "Linden Family", address: "33 Tierra Verde Cir", city: "Tierra Verde, FL",
    source: "Google Ads", dockType: "fixed_dock", scopeNote: "50' fixed dock w/ T-head",
    estimatedValue: 62300, probability: 45, lastContactDate: D(-8), nextActionDate: D(-2),
    nextActionNote: "Re-engage about permit timeline", owner: "Nick", temperature: "warm",
    stage: "follow_up", daysInStage: 13, daysSinceContact: 8,
    phone: "(727) 555-0731", email: "linden@example.com",
  },
  {
    id: "L-2060", customer: "Aboud Residence", address: "55 Pelican Bay", city: "Apollo Beach, FL",
    source: "Referral", dockType: "extension", scopeNote: "Extend 18', upgrade to PVC decking",
    estimatedValue: 31500, probability: 50, lastContactDate: D(-2), nextActionDate: D(3),
    nextActionNote: "Site visit to confirm depth", owner: "Nick", temperature: "warm",
    stage: "site_visit_scheduled", daysInStage: 2, daysSinceContact: 2,
    phone: "(813) 555-0623", email: "aboud@example.com",
  },
  {
    id: "L-2061", customer: "Whitfield Estate", address: "8 Westshore Yacht Club Dr", city: "Tampa, FL",
    source: "Architect", dockType: "fixed_dock", scopeNote: "Premium dock with covered slip",
    estimatedValue: 224000, probability: 60, lastContactDate: D(0), nextActionDate: D(2),
    nextActionNote: "Submit final proposal w/ engineering", owner: "Nick", temperature: "hot",
    stage: "proposal_sent", daysInStage: 4, daysSinceContact: 0,
    phone: "(813) 555-0481", email: "concierge@whitfield.example",
  },
  {
    id: "L-2062", customer: "Patel Property", address: "200 Marina Bay Dr", city: "Clearwater, FL",
    source: "Website", dockType: "floating_dock", scopeNote: "Two floating sections, ladder, cleats",
    estimatedValue: 38400, probability: 35, lastContactDate: D(-4), nextActionDate: D(1),
    nextActionNote: "Confirm aluminum vs steel frame", owner: "Nick", temperature: "warm",
    stage: "estimating", daysInStage: 4, daysSinceContact: 4,
    phone: "(727) 555-0288", email: "n.patel@example.com",
  },
];

// =====================================================================
// PROJECTS — 14 across all production stages
// =====================================================================
export const PROJECTS: Project[] = [
  {
    id: "P-1031", jobNumber: "DK-1031", customer: "Castellano Estate", address: "1414 Coral Way", city: "Tampa, FL",
    phone: "(813) 555-0850", email: "j.castellano@example.com",
    dockType: "rebuild", scopeSummary: "Rebuild 60' fixed dock + jet-ski floater",
    contractAmount: 132500, marginEstimate: 28, actualCostToDate: 0,
    depositStatus: "received", depositAmount: 33125,
    scheduledStart: day(28), forecastCompletion: day(70),
    projectManager: "Nick", crewId: "crew-a",
    health: "on_track", stage: "sold_handoff", daysInStage: 2, blockingIssue: null,
    waterfrontType: "bay", waterDepthFt: 5.5, bottomType: "mud",
    accessDifficulty: "moderate", existingStructureCondition: "poor",
    weatherSensitivity: "medium", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["Cleats", "Ladder", "Power pedestal", "Jet-ski floater"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-1), channel: "email", by: "Nick", note: "Contract counter-signed. Deposit received." },
      { id: "c2", date: D(-3), channel: "call", by: "Nick", note: "Discussed kickoff timeline." },
    ],
    jobNotes: "Owner wants weekly photo updates.",
  },
  {
    id: "P-1032", jobNumber: "DK-1032", customer: "Markham Residence", address: "601 Sailfish Dr", city: "Apollo Beach, FL",
    phone: "(813) 555-0271", email: "markham@example.com",
    dockType: "boat_lift", scopeSummary: "Replace failing 10k lift, new beams + motors",
    contractAmount: 19800, marginEstimate: 34, actualCostToDate: 0,
    depositStatus: "received", depositAmount: 4950,
    scheduledStart: day(7), forecastCompletion: day(11),
    projectManager: "Nick", crewId: "crew-d",
    health: "on_track", stage: "site_data_verified", daysInStage: 1, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 4.0, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "fair",
    weatherSensitivity: "low", mobilizationComplexity: "simple",
    pileType: "N/A — using existing", framingMaterial: "Aluminum", deckingMaterial: "N/A",
    accessories: ["10k lift kit", "GEM remote"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(0), channel: "site", by: "Crew D", note: "Confirmed beam height + bunk spacing." },
    ],
    jobNotes: "Existing pilings reusable. Confirmed by Crew D.",
  },
  {
    id: "P-1033", jobNumber: "DK-1033", customer: "Larkin Estate", address: "240 Bayshore Blvd", city: "Tampa, FL",
    phone: "(813) 555-0410", email: "larkin@example.com",
    dockType: "fixed_dock", scopeSummary: "75' fixed dock, T-head, 13k lift",
    contractAmount: 168400, marginEstimate: 26, actualCostToDate: 4200,
    depositStatus: "received", depositAmount: 42100,
    scheduledStart: day(22), forecastCompletion: day(75),
    projectManager: "Nick", crewId: null,
    health: "watch", stage: "design_engineering", daysInStage: 9, blockingIssue: "Awaiting engineer stamp",
    waterfrontType: "bay", waterDepthFt: 6.5, bottomType: "mixed",
    accessDifficulty: "moderate", existingStructureCondition: "n/a",
    weatherSensitivity: "medium", mobilizationComplexity: "barge_required",
    pileType: "Concrete 10x10", framingMaterial: "PT 2x12", deckingMaterial: "Ipe",
    accessories: ["13k lift", "Power", "Water", "LED lighting"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-2), channel: "email", by: "Engineer", note: "Awaiting wind-load calcs." },
    ],
    jobNotes: "Engineer expected to deliver Friday.",
  },
  {
    id: "P-1034", jobNumber: "DK-1034", customer: "Greer Residence", address: "11 Bayway Isles", city: "St. Petersburg, FL",
    phone: "(727) 555-0660", email: "greer@example.com",
    dockType: "fixed_dock", scopeSummary: "40' fixed dock with stairs to seawall",
    contractAmount: 71200, marginEstimate: 30, actualCostToDate: 1800,
    depositStatus: "received", depositAmount: 17800,
    scheduledStart: day(35), forecastCompletion: day(72),
    projectManager: "Nick", crewId: null,
    health: "on_track", stage: "permit_in_progress", daysInStage: 4, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 4.5, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "simple",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "Trex Transcend",
    accessories: ["Cleats", "Ladder"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-3), channel: "email", by: "Nick", note: "Drafting USACE package." },
    ],
    jobNotes: "USACE expected to be the long pole.",
  },
  {
    id: "P-1035", jobNumber: "DK-1035", customer: "Olsson Family", address: "303 Snell Isle", city: "St. Petersburg, FL",
    phone: "(727) 555-0712", email: "olsson@example.com",
    dockType: "extension", scopeSummary: "Extend dock 22' to deeper water",
    contractAmount: 39400, marginEstimate: 32, actualCostToDate: 1200,
    depositStatus: "received", depositAmount: 9850,
    scheduledStart: day(18), forecastCompletion: day(35),
    projectManager: "Nick", crewId: "crew-a",
    health: "watch", stage: "permit_submitted", daysInStage: 22, blockingIssue: "City review backlog",
    waterfrontType: "tidal", waterDepthFt: 3.5, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "good",
    weatherSensitivity: "low", mobilizationComplexity: "simple",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "Composite",
    accessories: ["Cleats"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-7), channel: "email", by: "City", note: "Acknowledgment of submission." },
    ],
    jobNotes: "Submitted 22 days ago. Following up weekly.",
  },
  {
    id: "P-1036", jobNumber: "DK-1036", customer: "Yarborough Residence", address: "9 Harbor Cay", city: "Clearwater, FL",
    phone: "(727) 555-0299", email: "yar@example.com",
    dockType: "rebuild", scopeSummary: "Rebuild after storm damage, like-for-like",
    contractAmount: 88200, marginEstimate: 27, actualCostToDate: 2400,
    depositStatus: "partial", depositAmount: 11000,
    scheduledStart: day(40), forecastCompletion: day(82),
    projectManager: "Nick", crewId: null,
    health: "at_risk", stage: "permit_revisions", daysInStage: 16, blockingIssue: "DEP requested revised drawings",
    waterfrontType: "bay", waterDepthFt: 5.0, bottomType: "mud",
    accessDifficulty: "moderate", existingStructureCondition: "failing",
    weatherSensitivity: "medium", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "Trex",
    accessories: ["Cleats", "Ladder", "Power"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-2), channel: "email", by: "FL DEP", note: "Comments returned. Need elevation revision." },
    ],
    jobNotes: "Engineer scheduled for Wed.",
  },
  {
    id: "P-1037", jobNumber: "DK-1037", customer: "Pendleton Residence", address: "44 Tierra Verde", city: "Tierra Verde, FL",
    phone: "(727) 555-0455", email: "pendleton@example.com",
    dockType: "fixed_dock", scopeSummary: "55' dock + 10k lift, ladder, kayak slide",
    contractAmount: 96800, marginEstimate: 31, actualCostToDate: 8500,
    depositStatus: "received", depositAmount: 24200,
    scheduledStart: day(-3), forecastCompletion: day(28),
    projectManager: "Nick", crewId: "crew-b",
    health: "on_track", stage: "permit_approved", daysInStage: 3, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 4.8, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["10k lift", "Ladder", "Kayak slide", "Cleats"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(0), channel: "email", by: "Nick", note: "Permit approved. Ordering materials." },
    ],
    jobNotes: "",
  },
  {
    id: "P-1038", jobNumber: "DK-1038", customer: "Whitcomb Estate", address: "1010 Westshore", city: "Tampa, FL",
    phone: "(813) 555-0780", email: "whit@example.com",
    dockType: "fixed_dock", scopeSummary: "Premium ipe dock, 70', covered slip",
    contractAmount: 248500, marginEstimate: 24, actualCostToDate: 18400,
    depositStatus: "received", depositAmount: 62000,
    scheduledStart: day(14), forecastCompletion: day(95),
    projectManager: "Nick", crewId: "crew-b",
    health: "watch", stage: "materials_ordered", daysInStage: 5, blockingIssue: "Ipe lead time 6+ weeks",
    waterfrontType: "bay", waterDepthFt: 7.0, bottomType: "rock",
    accessDifficulty: "difficult", existingStructureCondition: "n/a",
    weatherSensitivity: "high", mobilizationComplexity: "barge_required",
    pileType: "Concrete 12x12", framingMaterial: "PT 2x12", deckingMaterial: "Ipe",
    accessories: ["16k lift", "Cover", "Power", "Water", "Lighting", "Cleats"],
    changeOrderCount: 1,
    comms: [
      { id: "c1", date: D(-1), channel: "email", by: "Supplier", note: "Ipe ETA confirmed: 6.5 weeks." },
    ],
    jobNotes: "Phased approach — frame first, decking last.",
  },
  {
    id: "P-1039", jobNumber: "DK-1039", customer: "Russo Property", address: "601 Marina Pointe", city: "Tampa, FL",
    phone: "(813) 555-0322", email: "russo@example.com",
    dockType: "floating_dock", scopeSummary: "Floating system + gangway",
    contractAmount: 64200, marginEstimate: 35, actualCostToDate: 9800,
    depositStatus: "received", depositAmount: 16050,
    scheduledStart: day(11), forecastCompletion: day(25),
    projectManager: "Nick", crewId: "crew-c",
    health: "on_track", stage: "fabrication_prep", daysInStage: 3, blockingIssue: null,
    waterfrontType: "canal", waterDepthFt: 6.0, bottomType: "mud",
    accessDifficulty: "easy", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "simple",
    pileType: "Treated CCA 8x8", framingMaterial: "Aluminum", deckingMaterial: "EZ Dock composite",
    accessories: ["Gangway", "Cleats", "Bumpers"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-1), channel: "site", by: "Crew C", note: "Floats arrived. Gangway hardware on order." },
    ],
    jobNotes: "",
  },
  {
    id: "P-1040", jobNumber: "DK-1040", customer: "Brennan Residence", address: "3140 Beachway", city: "Clearwater, FL",
    phone: "(727) 555-0233", email: "k.brennan@example.com",
    dockType: "repair", scopeSummary: "Replace 8 piles, decking spot repair",
    contractAmount: 18400, marginEstimate: 38, actualCostToDate: 0,
    depositStatus: "invoiced", depositAmount: 4600,
    scheduledStart: day(14), forecastCompletion: day(18),
    projectManager: "Nick", crewId: "crew-a",
    health: "at_risk", stage: "scheduled", daysInStage: 1, blockingIssue: "Deposit not yet received",
    waterfrontType: "tidal", waterDepthFt: 4.0, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "fair",
    weatherSensitivity: "low", mobilizationComplexity: "simple",
    pileType: "Treated CCA 8x8", framingMaterial: "N/A", deckingMaterial: "Composite",
    accessories: [],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-2), channel: "email", by: "Nick", note: "Deposit invoice sent. Awaiting payment." },
    ],
    jobNotes: "Hold install until deposit clears.",
  },
  {
    id: "P-1041", jobNumber: "DK-1041", customer: "Sanderson Estate", address: "12 Davis Islands", city: "Tampa, FL",
    phone: "(813) 555-0911", email: "sanderson@example.com",
    dockType: "fixed_dock", scopeSummary: "65' L-shape dock, 13k lift",
    contractAmount: 142800, marginEstimate: 27, actualCostToDate: 38400,
    depositStatus: "received", depositAmount: 35700,
    scheduledStart: day(-7), forecastCompletion: day(34),
    projectManager: "Nick", crewId: "crew-b",
    health: "on_track", stage: "mobilization", daysInStage: 1, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 5.5, bottomType: "mixed",
    accessDifficulty: "moderate", existingStructureCondition: "n/a",
    weatherSensitivity: "medium", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["13k lift", "Cleats", "Ladder", "Power"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(0), channel: "site", by: "Crew B", note: "Site setup complete. Pile driver staged." },
    ],
    jobNotes: "Weather window favorable through next Wed.",
  },
  {
    id: "P-1042", jobNumber: "DK-1042", customer: "Ekberg Property", address: "44 Causeway", city: "Dunedin, FL",
    phone: "(727) 555-0117", email: "ekberg@example.com",
    dockType: "pier", scopeSummary: "60' commercial-grade pier",
    contractAmount: 184600, marginEstimate: 25, actualCostToDate: 92300,
    depositStatus: "received", depositAmount: 46150,
    scheduledStart: day(-21), forecastCompletion: day(16),
    projectManager: "Nick", crewId: "crew-a",
    health: "watch", stage: "framing", daysInStage: 8, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 6.0, bottomType: "limestone",
    accessDifficulty: "difficult", existingStructureCondition: "n/a",
    weatherSensitivity: "medium", mobilizationComplexity: "barge_required",
    pileType: "Concrete 10x10", framingMaterial: "PT 2x12", deckingMaterial: "Ipe",
    accessories: ["Lighting", "Power", "Water"],
    changeOrderCount: 1,
    comms: [
      { id: "c1", date: D(-1), channel: "site", by: "Crew A", note: "Limestone bottom slowed pile install. 1 day behind." },
    ],
    jobNotes: "Watch pile-driving rate. Limestone harder than expected.",
  },
  {
    id: "P-1043", jobNumber: "DK-1043", customer: "Hartwell Estate", address: "7 Belleair Pointe", city: "Belleair, FL",
    phone: "(727) 555-0212", email: "hartwell@example.com",
    dockType: "fixed_dock", scopeSummary: "50' fixed dock + 10k lift + ladder",
    contractAmount: 78900, marginEstimate: 30, actualCostToDate: 41800,
    depositStatus: "received", depositAmount: 19725,
    scheduledStart: day(-32), forecastCompletion: day(8),
    projectManager: "Nick", crewId: "crew-b",
    health: "on_track", stage: "decking", daysInStage: 4, blockingIssue: null,
    waterfrontType: "tidal", waterDepthFt: 4.5, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["10k lift", "Ladder", "Cleats", "Power"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(0), channel: "site", by: "Crew B", note: "Decking 60% complete. Lift install Friday." },
    ],
    jobNotes: "Walkthrough scheduled next Wed.",
  },
  {
    id: "P-1044", jobNumber: "DK-1044", customer: "Reston Property", address: "9 Harbor Pl", city: "St. Petersburg, FL",
    phone: "(727) 555-0809", email: "reston@example.com",
    dockType: "fixed_dock", scopeSummary: "45' dock + 13k lift",
    contractAmount: 88400, marginEstimate: 31, actualCostToDate: 74200,
    depositStatus: "received", depositAmount: 22100,
    scheduledStart: day(-58), forecastCompletion: day(-2),
    projectManager: "Nick", crewId: "crew-d",
    health: "on_track", stage: "punch_list", daysInStage: 3, blockingIssue: null,
    waterfrontType: "bay", waterDepthFt: 5.0, bottomType: "sand",
    accessDifficulty: "easy", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["13k lift", "Cleats", "Ladder", "Power"],
    changeOrderCount: 0,
    comms: [
      { id: "c1", date: D(-1), channel: "site", by: "Crew D", note: "Lift adjustment, 2 board replacements remaining." },
    ],
    jobNotes: "Warranty docs prepped.",
  },
  {
    id: "P-1029", jobNumber: "DK-1029", customer: "Aurelia Trust", address: "108 Park Shore", city: "Clearwater, FL",
    phone: "(727) 555-0654", email: "aurelia@example.com",
    dockType: "fixed_dock", scopeSummary: "60' dock + 16k lift, lighting",
    contractAmount: 154200, marginEstimate: 28, actualCostToDate: 142100,
    depositStatus: "received", depositAmount: 38550,
    scheduledStart: day(-72), forecastCompletion: day(-8),
    projectManager: "Nick", crewId: "crew-d",
    health: "watch", stage: "final_invoice", daysInStage: 6, blockingIssue: "Final invoice issued, awaiting payment",
    waterfrontType: "tidal", waterDepthFt: 5.5, bottomType: "sand",
    accessDifficulty: "moderate", existingStructureCondition: "n/a",
    weatherSensitivity: "low", mobilizationComplexity: "standard",
    pileType: "Treated CCA 8x8", framingMaterial: "PT 2x10", deckingMaterial: "PVC AZEK",
    accessories: ["16k lift", "Lighting", "Power", "Cleats"],
    changeOrderCount: 2,
    comms: [
      { id: "c1", date: D(-3), channel: "email", by: "Nick", note: "Final invoice sent. Net 15." },
    ],
    jobNotes: "Final invoice ages day 6.",
  },
];

// =====================================================================
// PERMITS — one per active project
// =====================================================================
export const PERMITS: Permit[] = [
  {
    id: "PR-1031", projectId: "P-1031", jurisdiction: "Tampa, FL", agency: "Municipality",
    permitType: "Marine Construction", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: null, status: "drafting", reviewerComments: "",
    revisionDueDate: null, approvalTargetDate: day(35),
    inspectionRequirements: "Final inspection only", ageDays: 2,
  },
  {
    id: "PR-1033", projectId: "P-1033", jurisdiction: "Tampa, FL", agency: "Municipality",
    permitType: "Marine Construction + Wetlands", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: null, status: "drafting", reviewerComments: "Engineering pending",
    revisionDueDate: null, approvalTargetDate: day(45),
    inspectionRequirements: "Pre-pour, framing, final", ageDays: 9,
  },
  {
    id: "PR-1034", projectId: "P-1034", jurisdiction: "St. Petersburg / USACE", agency: "USACE",
    permitType: "Nationwide Permit 5", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: day(-2), status: "submitted", reviewerComments: "",
    revisionDueDate: null, approvalTargetDate: day(40),
    inspectionRequirements: "Final inspection", ageDays: 4,
  },
  {
    id: "PR-1035", projectId: "P-1035", jurisdiction: "St. Petersburg, FL", agency: "Municipality",
    permitType: "Dock Extension", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-22), status: "in_review", reviewerComments: "Reviewer assigned 5 days ago",
    revisionDueDate: null, approvalTargetDate: day(10),
    inspectionRequirements: "Final inspection", ageDays: 22,
  },
  {
    id: "PR-1036", projectId: "P-1036", jurisdiction: "Pinellas / FL DEP", agency: "FL DEP",
    permitType: "Submerged Lands Authorization", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: day(-30), status: "revisions", reviewerComments: "Elevation drawings need NAVD88 datum noted",
    revisionDueDate: day(7), approvalTargetDate: day(28),
    inspectionRequirements: "Pre-construction + final", ageDays: 30,
  },
  {
    id: "PR-1037", projectId: "P-1037", jurisdiction: "Tierra Verde / FL DEP", agency: "FL DEP",
    permitType: "General Permit", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-45), status: "approved", reviewerComments: "Approved",
    revisionDueDate: null, approvalTargetDate: day(-3),
    inspectionRequirements: "Final inspection only", ageDays: 45,
  },
  {
    id: "PR-1038", projectId: "P-1038", jurisdiction: "Tampa / USACE", agency: "USACE",
    permitType: "Nationwide Permit 5", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: day(-50), status: "approved", reviewerComments: "Approved with conditions",
    revisionDueDate: null, approvalTargetDate: day(-12),
    inspectionRequirements: "Final inspection + photo set", ageDays: 50,
  },
  {
    id: "PR-1039", projectId: "P-1039", jurisdiction: "Tampa, FL", agency: "Municipality",
    permitType: "Floating Dock Permit", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-25), status: "approved", reviewerComments: "Approved",
    revisionDueDate: null, approvalTargetDate: day(-5),
    inspectionRequirements: "Final inspection", ageDays: 25,
  },
  {
    id: "PR-1042", projectId: "P-1042", jurisdiction: "Dunedin / FL DEP", agency: "FL DEP",
    permitType: "Commercial Pier ERP", drawingsNeeded: true, engineeringNeeded: true,
    submissionDate: day(-90), status: "approved", reviewerComments: "Approved with manatee conditions",
    revisionDueDate: null, approvalTargetDate: day(-22),
    inspectionRequirements: "Pre + post + photo set", ageDays: 90,
  },
  {
    id: "PR-1043", projectId: "P-1043", jurisdiction: "Belleair, FL", agency: "Municipality",
    permitType: "Marine Construction", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-65), status: "approved", reviewerComments: "Approved",
    revisionDueDate: null, approvalTargetDate: day(-32),
    inspectionRequirements: "Final inspection", ageDays: 65,
  },
  {
    id: "PR-1044", projectId: "P-1044", jurisdiction: "St. Petersburg, FL", agency: "Municipality",
    permitType: "Marine Construction", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-90), status: "approved", reviewerComments: "Approved",
    revisionDueDate: null, approvalTargetDate: day(-58),
    inspectionRequirements: "Final inspection passed", ageDays: 90,
  },
  {
    id: "PR-1029", projectId: "P-1029", jurisdiction: "Clearwater, FL", agency: "Municipality",
    permitType: "Marine Construction", drawingsNeeded: true, engineeringNeeded: false,
    submissionDate: day(-110), status: "approved", reviewerComments: "Approved + closed",
    revisionDueDate: null, approvalTargetDate: day(-72),
    inspectionRequirements: "Final inspection passed", ageDays: 110,
  },
];

// =====================================================================
// INVOICES
// =====================================================================
export const INVOICES: Invoice[] = [
  // Deposits
  { id: "INV-D-1031", projectId: "P-1031", type: "deposit", amount: 33125, issuedDate: day(-2), dueDate: day(-2), paidDate: day(-1), status: "paid" },
  { id: "INV-D-1032", projectId: "P-1032", type: "deposit", amount: 4950,  issuedDate: day(-3), dueDate: day(-3), paidDate: day(-2), status: "paid" },
  { id: "INV-D-1033", projectId: "P-1033", type: "deposit", amount: 42100, issuedDate: day(-12), dueDate: day(-12), paidDate: day(-9), status: "paid" },
  { id: "INV-D-1034", projectId: "P-1034", type: "deposit", amount: 17800, issuedDate: day(-7),  dueDate: day(-7),  paidDate: day(-5), status: "paid" },
  { id: "INV-D-1035", projectId: "P-1035", type: "deposit", amount: 9850,  issuedDate: day(-30), dueDate: day(-30), paidDate: day(-26), status: "paid" },
  { id: "INV-D-1036", projectId: "P-1036", type: "deposit", amount: 22050, issuedDate: day(-15), dueDate: day(-8),  paidDate: null,    status: "overdue", note: "Partial received; balance overdue" },
  { id: "INV-D-1037", projectId: "P-1037", type: "deposit", amount: 24200, issuedDate: day(-20), dueDate: day(-20), paidDate: day(-19), status: "paid" },
  { id: "INV-D-1038", projectId: "P-1038", type: "deposit", amount: 62000, issuedDate: day(-45), dueDate: day(-45), paidDate: day(-44), status: "paid" },
  { id: "INV-D-1039", projectId: "P-1039", type: "deposit", amount: 16050, issuedDate: day(-12), dueDate: day(-12), paidDate: day(-11), status: "paid" },
  { id: "INV-D-1040", projectId: "P-1040", type: "deposit", amount: 4600,  issuedDate: day(-2),  dueDate: day(2),   paidDate: null,    status: "sent",    note: "Awaiting payment — install gated by deposit" },
  { id: "INV-D-1041", projectId: "P-1041", type: "deposit", amount: 35700, issuedDate: day(-25), dueDate: day(-25), paidDate: day(-23), status: "paid" },
  { id: "INV-D-1042", projectId: "P-1042", type: "deposit", amount: 46150, issuedDate: day(-60), dueDate: day(-60), paidDate: day(-59), status: "paid" },
  { id: "INV-D-1043", projectId: "P-1043", type: "deposit", amount: 19725, issuedDate: day(-50), dueDate: day(-50), paidDate: day(-49), status: "paid" },
  { id: "INV-D-1044", projectId: "P-1044", type: "deposit", amount: 22100, issuedDate: day(-90), dueDate: day(-90), paidDate: day(-89), status: "paid" },
  { id: "INV-D-1029", projectId: "P-1029", type: "deposit", amount: 38550, issuedDate: day(-110),dueDate: day(-110),paidDate: day(-108), status: "paid" },

  // Progress
  { id: "INV-P-1042", projectId: "P-1042", type: "progress", amount: 60000, issuedDate: day(-25), dueDate: day(-10), paidDate: day(-9), status: "paid" },
  { id: "INV-P-1043", projectId: "P-1043", type: "progress", amount: 25000, issuedDate: day(-15), dueDate: day(0),   paidDate: day(-1), status: "paid" },

  // Final invoices
  { id: "INV-F-1029", projectId: "P-1029", type: "final", amount: 77100, issuedDate: day(-3), dueDate: day(12), paidDate: null, status: "sent" },
  { id: "INV-F-1044", projectId: "P-1044", type: "final", amount: 44200, issuedDate: day(-30), dueDate: day(-15), paidDate: null, status: "overdue", note: "15 days overdue" },

  // Change orders
  { id: "INV-CO-1038", projectId: "P-1038", type: "change_order", amount: 12400, issuedDate: day(-10), dueDate: day(5), paidDate: null, status: "sent", note: "Lighting upgrade" },
  { id: "INV-CO-1042", projectId: "P-1042", type: "change_order", amount: 8200,  issuedDate: day(-5),  dueDate: day(10), paidDate: null, status: "sent", note: "Limestone surcharge" },
  { id: "INV-CO-1029", projectId: "P-1029", type: "change_order", amount: 4800,  issuedDate: day(-30), dueDate: day(-15), paidDate: day(-14), status: "paid", note: "Lighting upgrade" },
];

// =====================================================================
// CHANGE ORDERS
// =====================================================================
export const CHANGE_ORDERS: ChangeOrder[] = [
  { id: "CO-1038-1", projectId: "P-1038", date: day(-10), description: "Add LED dock lighting + transformer", amount: 12400, status: "billed" },
  { id: "CO-1042-1", projectId: "P-1042", date: day(-5),  description: "Limestone bottom surcharge — pile driving",   amount: 8200,  status: "billed" },
  { id: "CO-1029-1", projectId: "P-1029", date: day(-30), description: "Premium dock lighting upgrade",               amount: 4800,  status: "billed" },
  { id: "CO-1029-2", projectId: "P-1029", date: day(-12), description: "Additional cleats (2)",                       amount: 480,   status: "approved" },
];

// =====================================================================
// SCHEDULE — 2 weeks of activity
// =====================================================================
export const SCHEDULE: ScheduleItem[] = [
  // Site visits (sales)
  { id: "S1",  date: day(-1), type: "site_visit",        title: "Whitman Yacht Club — site walk", leadId: "L-2045", crew: "Nick", weatherRisk: "low" },
  { id: "S2",  date: day(0),  type: "site_visit",        title: "Beaumont — tide chart review", leadId: "L-2055", crew: "Nick", weatherRisk: "low" },
  { id: "S3",  date: day(2),  type: "site_visit",        title: "Hollister — measure & assess", leadId: "L-2041", crew: "Nick", weatherRisk: "low" },
  { id: "S4",  date: day(3),  type: "site_visit",        title: "Aboud — depth verification",   leadId: "L-2060", crew: "Nick", weatherRisk: "medium" },

  // Permit deadlines
  { id: "S5",  date: day(7),  type: "permit_deadline",   title: "DEP revisions due — DK-1036", projectId: "P-1036", weatherRisk: "low" },
  { id: "S6",  date: day(10), type: "permit_deadline",   title: "City review target — DK-1035", projectId: "P-1035", weatherRisk: "low" },

  // Material deliveries
  { id: "S7",  date: day(1),  type: "material_delivery", title: "Pilings to yard — DK-1037 (12)", projectId: "P-1037", weatherRisk: "low" },
  { id: "S8",  date: day(4),  type: "material_delivery", title: "Aluminum frame — DK-1039",      projectId: "P-1039", weatherRisk: "low" },
  { id: "S9",  date: day(8),  type: "material_delivery", title: "AZEK decking — DK-1037",        projectId: "P-1037", weatherRisk: "low" },

  // Fabrication
  { id: "S10", date: day(2),  type: "fabrication_milestone", title: "Floater frame fab — DK-1039", projectId: "P-1039", crew: "Crew C", weatherRisk: "low" },

  // Mobilization & installs
  { id: "S11", date: day(0),  type: "mobilization",      title: "Mobilize barge — DK-1041",     projectId: "P-1041", crew: "Crew B", equipment: ["Barge 28", "Pile Driver D19"], weatherRisk: "low" },
  { id: "S12", date: day(7),  type: "install_start",     title: "Install start — DK-1032 (lift swap)", projectId: "P-1032", crew: "Crew D", weatherRisk: "low" },
  { id: "S13", date: day(11), type: "install_start",     title: "Install start — DK-1039 (floater)", projectId: "P-1039", crew: "Crew C", weatherRisk: "medium" },
  { id: "S14", date: day(14), type: "install_start",     title: "Install start — DK-1040 (repairs)", projectId: "P-1040", crew: "Crew A", weatherRisk: "low" },
  { id: "S15", date: day(11), type: "install_finish",    title: "Finish target — DK-1032",           projectId: "P-1032", weatherRisk: "low" },

  // Inspections
  { id: "S16", date: day(8),  type: "inspection",        title: "Final walkthrough — DK-1043", projectId: "P-1043", weatherRisk: "low" },
  { id: "S17", date: day(-2), type: "inspection",        title: "Pre-construction — DK-1037", projectId: "P-1037", weatherRisk: "low" },

  // High-value sales follow-ups (estimate review)
  { id: "S18", date: day(4),  type: "estimate_review",   title: "Holcomb Marina engineering review", leadId: "L-2054", crew: "Nick", weatherRisk: "low" },
  { id: "S19", date: day(2),  type: "estimate_review",   title: "Whitfield — final proposal walkthrough", leadId: "L-2061", crew: "Nick", weatherRisk: "low" },

  // Crew B continued install (multi-day flag)
  { id: "S20", date: day(0),  endDate: day(14), type: "install_start", title: "Sanderson framing window — DK-1041", projectId: "P-1041", crew: "Crew B", weatherRisk: "medium" },
];
