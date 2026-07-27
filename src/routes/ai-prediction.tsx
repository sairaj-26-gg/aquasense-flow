import { createFileRoute } from "@tanstack/react-router";
import { Brain, Sparkles, Calendar, TrendingUp, ShieldAlert } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { PIPELINES, SENSOR_DATA } from "@/lib/mock-data";
import { linearRegression, movingAverage, zScoreOutliers } from "@/lib/algorithms";

export const Route = createFileRoute("/ai-prediction")({
  head: () => ({
    meta: [
      { title: "AI Prediction · AquaSense AI" },
      {
        name: "description",
        content: "AI-powered failure prediction, risk scoring, and maintenance recommendations for every pipeline.",
      },
      { property: "og:title", content: "AI Prediction · AquaSense AI" },
      { property: "og:description", content: "Predictive pipeline analytics powered by JavaScript algorithms." },
    ],
  }),
  component: AIPrediction,
});

function AIPrediction() {
  const focus = PIPELINES.slice(0, 6);
  const sample = useMemo(() => SENSOR_DATA.slice(0, 60).reverse(), []);
  const values = sample.map((s) => s.pressure);
  const ma = movingAverage(values, 6);
  const { slope, intercept } = linearRegression(values);
  const outliers = new Set(zScoreOutliers(values, 1.6));

  const chartData = sample.map((s, i) => ({
    t: new Date(s.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    pressure: s.pressure,
    ma: +ma[i].toFixed(2),
    trend: +(slope * i + intercept).toFixed(2),
    outlier: outliers.has(i) ? s.pressure : null,
  }));

  return (
    <PageShell
      title="AI prediction"
      subtitle="Threshold detection, moving average, linear regression, trend analysis, risk scoring & Z-score outliers."
      actions={
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/15">
          <Sparkles className="mr-1 h-3 w-3" /> Model refreshed 4 min ago
        </Badge>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="neo-card-lg p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Pressure signal — algorithmic view</div>
              <div className="text-lg font-semibold">Moving average · linear regression · Z-score</div>
            </div>
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10, right: 12 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.92 0.02 244)" />
                <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, border: "none", boxShadow: "var(--shadow-neo-sm)" }}
                />
                <ReferenceLine y={6} stroke="var(--color-health-crit)" strokeDasharray="4 4" label="Max" />
                <ReferenceLine y={2.5} stroke="var(--color-health-warn)" strokeDasharray="4 4" label="Min" />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="oklch(0.66 0.19 252)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ma"
                  stroke="oklch(0.72 0.17 155)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="oklch(0.78 0.14 210)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="outlier"
                  stroke="var(--color-health-crit)"
                  strokeWidth={0}
                  dot={{ r: 5, fill: "var(--color-health-crit)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legend color="oklch(0.66 0.19 252)" label="Pressure" />
            <Legend color="oklch(0.72 0.17 155)" label="Moving avg (6)" />
            <Legend color="oklch(0.78 0.14 210)" label="Linear trend" dashed />
            <Legend color="var(--color-health-crit)" label="Z-score outlier" dot />
          </div>
        </div>

        <div className="neo-card-lg p-6">
          <div className="mb-4 text-lg font-semibold">Model summary</div>
          <ul className="space-y-3 text-sm">
            <SumRow label="Trend slope" value={slope.toFixed(3)} icon={TrendingUp} />
            <SumRow
              label="Anomalies detected"
              value={`${outliers.size}/${values.length}`}
              icon={ShieldAlert}
            />
            <SumRow label="Confidence" value="92%" icon={Sparkles} />
            <SumRow label="Next re-train" value="in 6 h" icon={Calendar} />
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {focus.map((p) => (
          <div key={p.id} className="neo-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{p.code}</div>
                <div className="text-xs text-muted-foreground">{p.zone}</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {p.risk}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Mini label="Failure prob." value={`${p.failureProbability}%`} />
              <Mini label="Confidence" value={`${p.confidence}%`} />
              <Mini label="Health" value={`${p.health}/100`} />
              <Mini label="Next svc." value={p.predictedMaintenance} />
            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 p-3 text-xs">
              <div className="font-semibold text-primary">Recommendation</div>
              <div className="mt-1 text-foreground/80">
                {p.risk >= 65
                  ? "Isolate segment; replace valve within 48h."
                  : p.risk >= 35
                    ? "Schedule inspection this week; monitor pressure trend."
                    : "Continue routine monitoring."}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function SumRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </li>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
function Legend({ color, label, dashed, dot }: { color: string; label: string; dashed?: boolean; dot?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      {dot ? (
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      ) : (
        <span
          className="h-0.5 w-6"
          style={{ background: color, borderTop: dashed ? `2px dashed ${color}` : undefined }}
        />
      )}
      {label}
    </span>
  );
}
