import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Droplet, Gauge, Thermometer } from "lucide-react";

import { PageShell, StatusDot } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PIPELINES, ZONES } from "@/lib/mock-data";
import { statusFromRisk } from "@/lib/algorithms";

export const Route = createFileRoute("/live-monitoring")({
  head: () => ({
    meta: [
      { title: "Live Monitoring · AquaSense AI" },
      {
        name: "description",
        content: "Live pipeline telemetry: pressure, flow, temperature, water level and health per zone.",
      },
      { property: "og:title", content: "Live Monitoring · AquaSense AI" },
      { property: "og:description", content: "Realtime pipeline telemetry across every zone." },
    ],
  }),
  component: LiveMonitoring,
});

function LiveMonitoring() {
  const [tick, setTick] = useState(0);
  const [zone, setZone] = useState<string>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2500);
    return () => clearInterval(t);
  }, []);

  const pipelines = useMemo(() => {
    // Wiggle telemetry live
    return PIPELINES.map((p) => {
      const jitter = (Math.sin((tick + p.code.charCodeAt(3)) * 0.7) + 1) / 2;
      const pressure = +(p.pressure + (jitter - 0.5) * 0.4).toFixed(2);
      const flow = +(p.flow + (jitter - 0.5) * 12).toFixed(1);
      const temperature = +(p.temperature + (jitter - 0.5) * 0.6).toFixed(1);
      const waterLevel = Math.max(0, Math.min(100, +(p.waterLevel + (jitter - 0.5) * 3).toFixed(1)));
      return { ...p, pressure, flow, temperature, waterLevel };
    })
      .filter((p) => (zone === "All" ? true : p.zone === zone))
      .filter((p) =>
        q.trim().length ? p.code.toLowerCase().includes(q.toLowerCase()) : true,
      );
  }, [tick, zone, q]);

  return (
    <PageShell
      title="Live monitoring"
      subtitle="Streaming telemetry from every pipeline in the network."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pipeline ID…"
          className="max-w-xs rounded-full border-none bg-card shadow-[var(--shadow-neo-inset)]"
        />
        <div className="flex flex-wrap gap-2">
          {["All", ...ZONES].map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                zone === z
                  ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                  : "bg-card text-muted-foreground shadow-[var(--shadow-neo-sm)]"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pipelines.slice(0, 24).map((p) => {
          const status = statusFromRisk(p.risk);
          return (
            <motion.div
              key={p.id}
              layout
              className="neo-card p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={status} />
                    <span className="text-sm font-semibold">{p.code}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.zone}</div>
                </div>
                <Badge variant="outline" className="rounded-full border-transparent bg-secondary text-[10px]">
                  {p.lastUpdated}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric icon={Gauge} label="Pressure" value={`${p.pressure} bar`} />
                <Metric icon={Activity} label="Flow" value={`${p.flow} L/m`} />
                <Metric icon={Thermometer} label="Temp" value={`${p.temperature}°C`} />
                <Metric icon={Droplet} label="Level" value={`${p.waterLevel}%`} />
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Health score</span>
                  <span className="font-semibold">{p.health}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.health}%`,
                      background:
                        status === "critical"
                          ? "var(--color-health-crit)"
                          : status === "warning"
                            ? "var(--color-health-warn)"
                            : "var(--color-health-good)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}
