import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Wrench, Sparkles, Droplet } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS, type Notification } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · AquaSense AI" },
      { name: "description", content: "Leak alerts, maintenance reminders and system updates." },
      { property: "og:title", content: "Notifications · AquaSense AI" },
      { property: "og:description", content: "Your notification center for the water network." },
    ],
  }),
  component: NotificationsPage,
});

const icons = {
  leak: Droplet,
  maintenance: Wrench,
  system: Sparkles,
} as const;

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const unread = items.filter((i) => !i.read).length;

  return (
    <PageShell
      title="Notifications"
      subtitle={`${unread} unread · Leak alerts, maintenance & system updates.`}
      actions={
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setItems((prev) => prev.map((i) => ({ ...i, read: true })))}
        >
          <Bell className="mr-2 h-4 w-4" /> Mark all read
        </Button>
      }
    >
      <div className="neo-card-lg divide-y divide-border/60 overflow-hidden">
        {items.map((n) => {
          const Icon = icons[n.type];
          return (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-5 transition ${!n.read ? "bg-primary/[0.04]" : ""}`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  n.type === "leak"
                    ? "bg-[var(--color-health-crit)]/15 text-[var(--color-health-crit)]"
                    : n.type === "maintenance"
                      ? "bg-primary/10 text-primary"
                      : "bg-[var(--color-health-good)]/15 text-[var(--color-health-good)]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{n.title}</div>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>
                <div className="mt-1 text-xs text-muted-foreground">{n.at}</div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
