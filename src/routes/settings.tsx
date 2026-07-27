import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AquaSense AI" },
      { name: "description", content: "Configure theme, notifications, security and profile settings." },
      { property: "og:title", content: "Settings · AquaSense AI" },
      { property: "og:description", content: "Configure your AquaSense AI workspace." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <PageShell title="Settings" subtitle="Personalize your workspace.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Group title="Appearance">
          <Toggle label="Reduce motion" />
          <Toggle label="High-contrast alerts" defaultChecked />
          <Toggle label="Compact density" />
        </Group>

        <Group title="Notifications">
          <Toggle label="In-app leak alerts" defaultChecked />
          <Toggle label="Email digest (daily)" defaultChecked />
          <Toggle label="SMS critical alerts" />
        </Group>

        <Group title="Security">
          <Toggle label="Two-factor authentication" defaultChecked />
          <Toggle label="Session timeout 30m" />
          <Toggle label="Restrict IPs by zone" />
        </Group>

        <Group title="Data & AI">
          <Toggle label="Retrain models nightly" defaultChecked />
          <Toggle label="Share anonymized telemetry" />
          <Toggle label="Enable predictive dispatch" defaultChecked />
        </Group>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" className="rounded-full">
          Reset
        </Button>
        <Button className="rounded-full gradient-primary text-white">Save settings</Button>
      </div>
    </PageShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="neo-card-lg p-6">
      <div className="mb-4 text-lg font-semibold">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
      <Label className="text-sm">{label}</Label>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
