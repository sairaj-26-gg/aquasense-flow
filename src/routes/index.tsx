import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Droplet,
  AlertTriangle,
  ShieldCheck,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Waves,
  Wrench,
  Sparkles,
  Bell,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useState } from "react";
import { toast } from "sonner";
import { PageShell, StatusDot } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAILY, LEAK_ALERTS, MAINTENANCE, PIPELINES, summary } from "@/lib/mock-data";

const CREW = [
  "Meera Iyer",
  "Rahul Verma",
  "Aisha Khan",
  "Diego Alvarez",
  "Priya Nair",
];

function buildAiReport(s: ReturnType<typeof summary>) {
  const now = new Date();
  const topAlerts = [...LEAK_ALERTS]
    .sort((a, b) => +new Date(b.detectedAt) - +new Date(a.detectedAt))
    .slice(0, 10);
  const lines: string[] = [];
  lines.push("AquaSense AI — Command Report");
  lines.push(`Generated: ${now.toLocaleString()}`);
  lines.push("".padEnd(48, "="));
  lines.push("");
  lines.push("Network summary");
  lines.push(`  Pipelines monitored : ${s.monitored}`);
  lines.push(`  Active leaks        : ${s.activeLeaks}`);
  lines.push(`  High-risk pipelines : ${s.highRisk}`);
  lines.push(`  Water saved today   : ${s.savedToday.toLocaleString()} L`);
  lines.push(`  Water loss          : ${s.waterLossPct}%`);
  lines.push("");
  lines.push("Health distribution");
  lines.push(`  Healthy  : ${s.distribution.healthy}`);
  lines.push(`  Warning  : ${s.distribution.warning}`);
  lines.push(`  Critical : ${s.distribution.critical}`);
  lines.push("");
  lines.push("Top 10 recent alerts");
  topAlerts.forEach((a, i) => {
    lines.push(
      `  ${String(i + 1).padStart(2, "0")}. [${a.severity}] ${a.pipelineCode} · ${a.location} · ${a.estimatedLossLpm} L/min`,
    );
  });
  return lines.join("\n");
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AquaSense AI" },
      {
        name: "description",
        content:
          "Live overview of pipeline health, active leaks, predicted maintenance and water savings across every zone.",
      },
      { property: "og:title", content: "AquaSense AI · Command dashboard" },
      {
        property: "og:description",
        content: "Real-time pipeline monitoring, AI leak prediction, and maintenance overview.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; positive?: boolean };
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "good" | "warn" | "crit";
}) {
  const accentClass =
    accent === "good"
      ? "bg-[var(--color-health-good)]/15 text-[var(--color-health-good)]"
      : accent === "warn"
        ? "bg-[var(--color-health-warn)]/15 text-[var(--color-health-warn)]"
        : accent === "crit"
          ? "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]"
          : "bg-primary/10 text-primary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="neo-card p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              delta.positive
                ? "bg-[var(--color-health-good)]/15 text-[var(--color-health-good)]"
                : "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]"
            }`}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-semibold tracking-tight">
          {value}
          {unit && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

function RadialLoss({ pct }: { pct: number }) {
  const size = 200;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="lossGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.74 0.15 250)" />
            <stop offset="100%" stopColor="oklch(0.58 0.22 254)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.94 0.02 244)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#lossGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          fill="none"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="text-4xl font-semibold tracking-tight">{pct}%</div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Water loss</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const s = summary();
  const distributionData = [
    { name: "Healthy", value: s.distribution.healthy, color: "var(--color-health-good)" },
    { name: "Warning", value: s.distribution.warning, color: "var(--color-health-warn)" },
    { name: "Critical", value: s.distribution.critical, color: "var(--color-health-crit)" },
  ];

  const recentAlerts = [...LEAK_ALERTS]
    .sort((a, b) => +new Date(b.detectedAt) - +new Date(a.detectedAt))
    .slice(0, 5);
  const upcoming = [...MAINTENANCE]
    .filter((m) => m.status !== "Completed")
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .slice(0, 4);

  return (
    <PageShell
      title="Command dashboard"
      subtitle="Smart Water. Smarter Cities. Live network intelligence across every zone."
      actions={
        <>
          <Button variant="outline" className="rounded-full">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Report
          </Button>
          <Button className="rounded-full gradient-primary text-white hover:opacity-95">
            <Wrench className="mr-2 h-4 w-4" />
            Dispatch crew
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pipelines monitored"
          value={s.monitored}
          icon={Gauge}
          delta={{ value: "+3 this wk", positive: true }}
        />
        <StatCard
          label="Active leaks"
          value={s.activeLeaks}
          icon={AlertTriangle}
          accent="crit"
          delta={{ value: "-2 vs yday", positive: true }}
        />
        <StatCard
          label="Water saved today"
          value={s.savedToday.toLocaleString()}
          unit="L"
          icon={Droplet}
          accent="good"
          delta={{ value: "+14%", positive: true }}
        />
        <StatCard
          label="High-risk pipelines"
          value={s.highRisk}
          icon={ShieldCheck}
          accent="warn"
          delta={{ value: "-5%", positive: true }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="neo-card-lg p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Consumption vs savings</div>
              <div className="text-lg font-semibold">Last 30 days</div>
            </div>
            <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
              <Waves className="mr-1 h-3 w-3" /> Live
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="use" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.19 252)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.66 0.19 252)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="save" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.92 0.02 244)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.7 0.02 258)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.7 0.02 258)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "none",
                    boxShadow: "var(--shadow-neo-sm)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="oklch(0.66 0.19 252)"
                  strokeWidth={2.5}
                  fill="url(#use)"
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  stroke="oklch(0.72 0.17 155)"
                  strokeWidth={2.5}
                  fill="url(#save)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card-lg flex flex-col items-center p-6"
        >
          <div className="mb-2 self-start">
            <div className="text-sm text-muted-foreground">Network efficiency</div>
            <div className="text-lg font-semibold">Loss indicator</div>
          </div>
          <RadialLoss pct={s.waterLossPct} />
          <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
            {distributionData.map((d) => (
              <div key={d.name} className="rounded-2xl bg-secondary/50 p-3">
                <div className="text-xs text-muted-foreground">{d.name}</div>
                <div className="text-lg font-semibold" style={{ color: d.color }}>
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="neo-card-lg p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Recent alerts</div>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
              View all
            </Button>
          </div>
          <ul className="divide-y divide-border/60">
            {recentAlerts.map((a) => (
              <li key={a.id} className="flex items-center gap-4 py-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    a.severity === "Critical"
                      ? "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]"
                      : a.severity === "High"
                        ? "bg-[var(--color-health-warn)]/15 text-[var(--color-health-warn)]"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {a.pipelineCode} · {a.location}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.detectedAt).toLocaleString()} · est. loss{" "}
                    {a.estimatedLossLpm} L/min
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-transparent bg-secondary text-xs"
                >
                  {a.severity}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="neo-card-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Pipeline health</div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={4}
                >
                  {distributionData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {distributionData.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="neo-card-lg p-6 lg:col-span-2">
          <div className="mb-4 text-lg font-semibold">Upcoming maintenance</div>
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.pipelineCode} · {t.zone} · {t.assignee}
                  </div>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground md:block">
                  <div>{t.scheduledFor}</div>
                  <div>{t.priority}</div>
                </div>
                <div className="w-24">
                  <div className="h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full gradient-primary"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="neo-card-lg p-6">
          <div className="mb-4 text-lg font-semibold">Activity timeline</div>
          <ol className="relative space-y-4 pl-5">
            <span className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
            {[
              "AI re-scored 100 pipelines",
              "Meera closed task #T-042",
              "PL-1032 marked critical",
              "Model retrained on 5k sensor rows",
              "Zone West audit completed",
            ].map((line, i) => (
              <li key={i} className="relative flex items-start gap-3">
                <span className="absolute -left-[9px] top-1.5">
                  <StatusDot status={i === 2 ? "critical" : i === 0 ? "warning" : "healthy"} />
                </span>
                <div>
                  <div className="text-sm">{line}</div>
                  <div className="text-xs text-muted-foreground">{i + 1} · {i * 12 + 4} min ago</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "New task", icon: Wrench },
          { label: "Run AI scan", icon: Sparkles },
          { label: "Export report", icon: Droplet },
          { label: "Broadcast alert", icon: Bell },
        ].map((q) => (
          <button
            key={q.label}
            className="neo-card flex items-center gap-3 px-4 py-4 text-left transition hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <q.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{q.label}</span>
          </button>
        ))}
      </div>

      {/* pipelines count reference for TS unused-var avoidance */}
      <div className="sr-only">{PIPELINES.length}</div>
    </PageShell>
  );
}
