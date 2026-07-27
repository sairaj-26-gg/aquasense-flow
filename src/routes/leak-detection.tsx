import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin, Clock, Droplet } from "lucide-react";
import { useState } from "react";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAK_ALERTS } from "@/lib/mock-data";

export const Route = createFileRoute("/leak-detection")({
  head: () => ({
    meta: [
      { title: "Leak Detection · AquaSense AI" },
      {
        name: "description",
        content: "All active water leak alerts with severity, location, estimated loss and recommended actions.",
      },
      { property: "og:title", content: "Leak Detection · AquaSense AI" },
      { property: "og:description", content: "Prioritized water leak alerts with recommended actions." },
    ],
  }),
  component: LeakDetection,
});

const sevColor = {
  Low: "bg-primary/10 text-primary",
  Medium: "bg-[var(--color-health-warn)]/15 text-[var(--color-health-warn)]",
  High: "bg-[var(--color-health-warn)]/20 text-[var(--color-health-warn)]",
  Critical: "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]",
} as const;

function LeakDetection() {
  const [filter, setFilter] = useState<string>("All");
  const alerts = LEAK_ALERTS.filter((a) => (filter === "All" ? true : a.severity === filter)).sort(
    (a, b) => +new Date(b.detectedAt) - +new Date(a.detectedAt),
  );

  return (
    <PageShell
      title="Leak detection"
      subtitle="Prioritized alerts with automated recommendations."
      actions={
        <div className="flex gap-2">
          {["All", "Critical", "High", "Medium", "Low"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === f
                  ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                  : "bg-card text-muted-foreground shadow-[var(--shadow-neo-sm)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {alerts.slice(0, 30).map((a) => (
          <div
            key={a.id}
            className={`neo-card p-5 ${a.severity === "Critical" ? "ring-2 ring-[var(--color-health-crit)]/40" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${sevColor[a.severity]}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <Badge className={`rounded-full ${sevColor[a.severity]} hover:${sevColor[a.severity]}`}>
                {a.severity}
              </Badge>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold">{a.pipelineCode}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {a.location}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl bg-secondary/60 p-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> Detected
                </div>
                <div className="mt-1 font-medium">
                  {new Date(a.detectedAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Droplet className="h-3 w-3" /> Est. loss
                </div>
                <div className="mt-1 font-medium">{a.estimatedLossLpm} L/min</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 p-3 text-xs">
              <div className="font-semibold text-primary">Recommended action</div>
              <div className="mt-1 text-foreground/80">{a.recommendation}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1 rounded-full gradient-primary text-white">
                Dispatch
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-full">
                Log
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
