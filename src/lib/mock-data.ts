import {
  riskScore,
  healthScore,
  statusFromRisk,
  failureProbability,
  predictedMaintenanceDate,
  confidenceScore,
} from "./algorithms";

// Deterministic pseudo-random so demo data is stable
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);
const DEMO_NOW = Date.UTC(2026, 6, 28, 9, 30, 0);

function deterministicMaintenanceDate(risk: number) {
  const daysAhead = Math.max(3, Math.round(120 - risk));
  const d = new Date(DEMO_NOW);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export const ZONES = [
  "North Sector",
  "East Sector",
  "South Sector",
  "West Sector",
  "Central Grid",
  "Industrial Park",
  "Riverside",
  "Downtown",
];

export type Status = "healthy" | "warning" | "critical";

export interface Pipeline {
  id: string;
  code: string;
  zone: string;
  pressure: number;
  flow: number;
  temperature: number;
  waterLevel: number;
  ageYears: number;
  leakHistory: number;
  maintenanceGapDays: number;
  risk: number;
  health: number;
  status: Status;
  lastUpdated: string;
  lat: number;
  lng: number;
  failureProbability: number;
  predictedMaintenance: string;
  confidence: number;
}

// Center around a fictional city (Bengaluru-ish, works with OSM tiles)
const CENTER_LAT = 12.9716;
const CENTER_LNG = 77.5946;

function buildPipeline(i: number): Pipeline {
  const zone = ZONES[i % ZONES.length];
  const pressure = between(2.5, 6.5);
  const flow = between(120, 320);
  const temperature = between(18, 32);
  const waterLevel = between(30, 98);
  const ageYears = Math.round(between(1, 32));
  const leakHistory = Math.floor(between(0, 6));
  const maintenanceGapDays = Math.round(between(10, 380));
  const risk = riskScore({ pressure, flow, ageYears, leakHistory, maintenanceGapDays });
  const health = healthScore(risk);
  const status = statusFromRisk(risk);
  const updatedMinutesAgo = Math.floor(between(0, 55));
  return {
    id: `p-${i + 1}`,
    code: `PL-${(1000 + i).toString()}`,
    zone,
    pressure: +pressure.toFixed(2),
    flow: +flow.toFixed(1),
    temperature: +temperature.toFixed(1),
    waterLevel: +waterLevel.toFixed(1),
    ageYears,
    leakHistory,
    maintenanceGapDays,
    risk,
    health,
    status,
    lastUpdated: `${updatedMinutesAgo} min ago`,
    lat: CENTER_LAT + between(-0.08, 0.08),
    lng: CENTER_LNG + between(-0.08, 0.08),
    failureProbability: failureProbability(risk),
    predictedMaintenance: deterministicMaintenanceDate(risk),
    confidence: confidenceScore(200, Math.max(1, 100 - health)),
  };
}

export const PIPELINES: Pipeline[] = Array.from({ length: 100 }, (_, i) => buildPipeline(i));

export interface LeakAlert {
  id: string;
  pipelineCode: string;
  zone: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  detectedAt: string;
  estimatedLossLpm: number;
  location: string;
  recommendation: string;
  lat: number;
  lng: number;
}

const SEVERITIES: LeakAlert["severity"][] = ["Low", "Medium", "High", "Critical"];
const STREETS = [
  "MG Road",
  "Brigade Rd",
  "Whitefield Ave",
  "Indiranagar 100ft",
  "Koramangala 5th Blk",
  "Jayanagar 4th Blk",
  "HSR Sector 2",
  "Marathahalli Rd",
];

export const LEAK_ALERTS: LeakAlert[] = Array.from({ length: 100 }, (_, i) => {
  const p = PIPELINES[Math.floor(rand() * PIPELINES.length)];
  const sev = pick(SEVERITIES);
  const minutesAgo = Math.floor(between(1, 60 * 24 * 3));
  const d = new Date(DEMO_NOW - minutesAgo * 60_000);
  const loss = Math.round(between(3, 220));
  return {
    id: `alert-${i + 1}`,
    pipelineCode: p.code,
    zone: p.zone,
    severity: sev,
    detectedAt: d.toISOString(),
    estimatedLossLpm: loss,
    location: `${pick(STREETS)} · ${p.zone}`,
    recommendation:
      sev === "Critical"
        ? "Dispatch emergency crew, isolate valve immediately"
        : sev === "High"
          ? "Schedule inspection within 24h, monitor pressure"
          : sev === "Medium"
            ? "Add to weekly maintenance route"
            : "Log and observe for 72h",
    lat: p.lat + between(-0.005, 0.005),
    lng: p.lng + between(-0.005, 0.005),
  };
});

export interface MaintenanceTask {
  id: string;
  title: string;
  pipelineCode: string;
  zone: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  assignee: string;
  scheduledFor: string;
}

const ENGINEERS = [
  "Aarav Sharma",
  "Priya Patel",
  "Rohan Iyer",
  "Meera Nair",
  "Vikram Rao",
  "Ananya Gupta",
];

export const MAINTENANCE: MaintenanceTask[] = Array.from({ length: 50 }, (_, i) => {
  const p = PIPELINES[Math.floor(rand() * PIPELINES.length)];
  const status = pick(["Pending", "In Progress", "Completed"] as const);
  const progress = status === "Completed" ? 100 : status === "In Progress" ? Math.floor(between(20, 90)) : 0;
  const daysAhead = Math.floor(between(-5, 21));
  const d = new Date(DEMO_NOW);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return {
    id: `task-${i + 1}`,
    title: pick([
      "Valve replacement",
      "Pressure calibration",
      "Leak repair",
      "Sensor recalibration",
      "Corrosion inspection",
      "Joint sealing",
    ]),
    pipelineCode: p.code,
    zone: p.zone,
    priority: pick(["Low", "Medium", "High", "Urgent"] as const),
    status,
    progress,
    assignee: pick(ENGINEERS),
    scheduledFor: d.toISOString().slice(0, 10),
  };
});

// 12 months of monthly analytics + 30 days of daily
export interface DailyPoint {
  day: string;
  usage: number;
  saved: number;
  leaks: number;
}
export const DAILY: DailyPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(DEMO_NOW);
  d.setDate(d.getDate() - (29 - i));
  return {
    day: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    usage: Math.round(between(8000, 14000)),
    saved: Math.round(between(400, 2200)),
    leaks: Math.floor(between(0, 8)),
  };
});

export interface MonthlyPoint {
  month: string;
  usage: number;
  saved: number;
  leaks: number;
}
export const MONTHLY: MonthlyPoint[] = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(DEMO_NOW);
  d.setMonth(d.getMonth() - (11 - i));
  return {
    month: d.toLocaleDateString("en", { month: "short" }),
    usage: Math.round(between(240000, 410000)),
    saved: Math.round(between(15000, 62000)),
    leaks: Math.floor(between(20, 90)),
  };
});

export interface SensorRecord {
  ts: number;
  pipelineId: string;
  pressure: number;
  flow: number;
}
// 5000 sensor records
export const SENSOR_DATA: SensorRecord[] = Array.from({ length: 5000 }, (_, i) => {
  const p = PIPELINES[i % PIPELINES.length];
  return {
    ts: DEMO_NOW - i * 60_000,
    pipelineId: p.id,
    pressure: +between(2, 7).toFixed(2),
    flow: +between(100, 340).toFixed(1),
  };
});

export interface Notification {
  id: string;
  type: "leak" | "maintenance" | "system";
  title: string;
  body: string;
  at: string;
  read: boolean;
}
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "leak",
    title: "Critical leak · PL-1032",
    body: "Estimated loss 180 L/min in Riverside zone. Emergency crew dispatched.",
    at: "3 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "maintenance",
    title: "Maintenance completed",
    body: "Meera Nair marked valve replacement complete on PL-1017.",
    at: "18 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "system",
    title: "AI model refreshed",
    body: "Prediction models re-trained on last 30d sensor data.",
    at: "1 h ago",
    read: false,
  },
  {
    id: "n4",
    type: "leak",
    title: "Warning · PL-1049",
    body: "Pressure anomaly detected in South Sector. Monitoring.",
    at: "2 h ago",
    read: true,
  },
  {
    id: "n5",
    type: "maintenance",
    title: "Task assigned",
    body: "You have a new inspection task scheduled for tomorrow.",
    at: "5 h ago",
    read: true,
  },
];

export function summary() {
  const activeLeaks = LEAK_ALERTS.filter(
    (l) => l.severity === "High" || l.severity === "Critical",
  ).length;
  const highRisk = PIPELINES.filter((p) => p.status !== "healthy").length;
  const savedToday = DAILY[DAILY.length - 1].saved;
  const waterLossPct = 6.4;
  const distribution = {
    healthy: PIPELINES.filter((p) => p.status === "healthy").length,
    warning: PIPELINES.filter((p) => p.status === "warning").length,
    critical: PIPELINES.filter((p) => p.status === "critical").length,
  };
  return {
    monitored: PIPELINES.length,
    activeLeaks,
    savedToday,
    highRisk,
    waterLossPct,
    distribution,
  };
}
