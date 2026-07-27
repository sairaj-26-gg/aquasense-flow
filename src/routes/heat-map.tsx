import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { ZONES } from "@/lib/mock-data";

export const Route = createFileRoute("/heat-map")({
  head: () => ({
    meta: [
      { title: "Heat Map · AquaSense AI" },
      {
        name: "description",
        content: "Interactive heat map of pipelines, leaks and zone boundaries powered by OpenStreetMap.",
      },
      { property: "og:title", content: "Heat Map · AquaSense AI" },
      { property: "og:description", content: "Geospatial view of leaks and pipelines across zones." },
    ],
  }),
  component: HeatMapPage,
});

const MapView = lazy(() => import("@/components/map-view"));

function HeatMapPage() {
  const [zone, setZone] = useState("All");
  const [severity, setSeverity] = useState("All");

  return (
    <PageShell
      title="Interactive heat map"
      subtitle="Pipeline network, leak markers and heat overlay on OpenStreetMap."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Zone</span>
        {["All", ...ZONES].map((z) => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              zone === z
                ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                : "bg-card text-muted-foreground shadow-[var(--shadow-neo-sm)]"
            }`}
          >
            {z}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Severity</span>
        {["All", "Critical", "High", "Medium", "Low"].map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              severity === s
                ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                : "bg-card text-muted-foreground shadow-[var(--shadow-neo-sm)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="neo-card-lg overflow-hidden p-2">
        <Suspense
          fallback={
            <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
              Loading map…
            </div>
          }
        >
          <MapView zone={zone} severity={severity} />
        </Suspense>
      </div>
    </PageShell>
  );
}
