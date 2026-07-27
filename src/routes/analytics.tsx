import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { PageShell } from "@/components/page-shell";
import { DAILY, MONTHLY, PIPELINES, ZONES, summary } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · AquaSense AI" },
      {
        name: "description",
        content: "Water usage, leak trends, pipeline health distribution and repair-time analytics.",
      },
      { property: "og:title", content: "Analytics · AquaSense AI" },
      { property: "og:description", content: "Deep analytics on water consumption and network health." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const s = summary();
  const distribution = [
    { name: "Healthy", value: s.distribution.healthy, color: "var(--color-health-good)" },
    { name: "Warning", value: s.distribution.warning, color: "var(--color-health-warn)" },
    { name: "Critical", value: s.distribution.critical, color: "var(--color-health-crit)" },
  ];

  const topLeakAreas = ZONES.map((z) => ({
    zone: z,
    leaks: PIPELINES.filter((p) => p.zone === z).reduce((acc, p) => acc + p.leakHistory, 0),
  }))
    .sort((a, b) => b.leaks - a.leaks)
    .slice(0, 6);

  return (
    <PageShell title="Analytics" subtitle="Consumption, savings, leak trends and network health.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Monthly water usage" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.92 0.02 244)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "none", boxShadow: "var(--shadow-neo-sm)" }} />
                <Bar dataKey="usage" fill="oklch(0.66 0.19 252)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="saved" fill="oklch(0.72 0.17 155)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Pipeline health distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" innerRadius={50} outerRadius={82} paddingAngle={4}>
                  {distribution.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-neo-sm)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Daily usage — last 30 days" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY} margin={{ left: -10, right: 12 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.92 0.02 244)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "none", boxShadow: "var(--shadow-neo-sm)" }} />
                <Line type="monotone" dataKey="usage" stroke="oklch(0.66 0.19 252)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="saved" stroke="oklch(0.72 0.17 155)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Leak trends">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.92 0.02 244)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "none", boxShadow: "var(--shadow-neo-sm)" }} />
                <Bar dataKey="leaks" fill="oklch(0.65 0.24 25)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top leak areas" className="lg:col-span-2">
          <ul className="space-y-3">
            {topLeakAreas.map((z, i) => {
              const max = topLeakAreas[0].leaks || 1;
              return (
                <li key={z.zone}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">
                      #{i + 1} · {z.zone}
                    </span>
                    <span className="text-muted-foreground">{z.leaks} historical leaks</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full gradient-primary"
                      style={{ width: `${(z.leaks / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Ops KPIs">
          <ul className="space-y-3 text-sm">
            <KPI label="Avg. repair time" value="4.2 h" />
            <KPI label="Water loss" value={`${s.waterLossPct}%`} />
            <KPI label="MTBF" value="128 h" />
            <KPI label="AI accuracy" value="92%" />
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`neo-card-lg p-6 ${className}`}>
      <div className="mb-4 text-lg font-semibold">{title}</div>
      {children}
    </div>
  );
}
function KPI({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-2xl bg-secondary/60 p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
