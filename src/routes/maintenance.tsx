import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, User, Calendar, CheckCircle2 } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAINTENANCE as SEED, type MaintenanceTask } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance · AquaSense AI" },
      {
        name: "description",
        content: "Assigned maintenance tasks, priorities, engineer assignments and repair history.",
      },
      { property: "og:title", content: "Maintenance · AquaSense AI" },
      { property: "og:description", content: "Track and update pipeline maintenance operations." },
    ],
  }),
  component: MaintenancePage,
});

const priColor = {
  Low: "bg-primary/10 text-primary",
  Medium: "bg-[var(--color-health-warn)]/15 text-[var(--color-health-warn)]",
  High: "bg-[var(--color-health-warn)]/20 text-[var(--color-health-warn)]",
  Urgent: "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]",
} as const;

function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(SEED);
  const [tab, setTab] = useState<"All" | "Pending" | "In Progress" | "Completed">("All");

  const filtered = tasks.filter((t) => (tab === "All" ? true : t.status === tab));

  const update = (id: string, patch: Partial<MaintenanceTask>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <PageShell
      title="Maintenance"
      subtitle="Accept tasks, update progress and close out repairs."
      actions={
        <div className="flex gap-2">
          {(["All", "Pending", "In Progress", "Completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                tab === t
                  ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                  : "bg-card text-muted-foreground shadow-[var(--shadow-neo-sm)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <div key={t.id} className="neo-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.pipelineCode} · {t.zone}
                  </div>
                </div>
              </div>
              <Badge className={`rounded-full ${priColor[t.priority]} hover:${priColor[t.priority]}`}>
                {t.priority}
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {t.assignee}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t.scheduledFor}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{t.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full gradient-primary" style={{ width: `${t.progress}%` }} />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {t.status === "Pending" && (
                <Button
                  size="sm"
                  className="flex-1 rounded-full gradient-primary text-white"
                  onClick={() => {
                    update(t.id, { status: "In Progress", progress: 20 });
                    toast.success("Task accepted");
                  }}
                >
                  Accept
                </Button>
              )}
              {t.status === "In Progress" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => update(t.id, { progress: Math.min(95, t.progress + 20) })}
                  >
                    +Progress
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-full gradient-primary text-white"
                    onClick={() => {
                      update(t.id, { status: "Completed", progress: 100 });
                      toast.success("Task marked completed");
                    }}
                  >
                    Complete
                  </Button>
                </>
              )}
              {t.status === "Completed" && (
                <div className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[var(--color-health-good)]/15 py-1.5 text-xs font-medium text-[var(--color-health-good)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
