import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Lock, Mail, Building2, Shield } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · AquaSense AI" },
      { name: "description", content: "Manage your profile, department, role and notification preferences." },
      { property: "og:title", content: "Profile · AquaSense AI" },
      { property: "og:description", content: "Your AquaSense AI account settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  return (
    <PageShell title="Profile" subtitle="Manage your identity and preferences.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="neo-card-lg p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white shadow-[var(--shadow-glow)]">
              AR
            </div>
            <div className="mt-4 text-lg font-semibold">Aarav Rao</div>
            <div className="text-sm text-muted-foreground">Senior Water Engineer</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Admin</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">Engineer</span>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            <Row icon={Mail} label="Email" value="aarav@aquasense.ai" />
            <Row icon={Building2} label="Department" value="Water Operations · Zone Central" />
            <Row icon={Shield} label="Role" value="Admin · Engineer" />
          </ul>

          <Button variant="outline" className="mt-6 w-full rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="neo-card-lg p-6 lg:col-span-2">
          <div className="mb-4 text-lg font-semibold">Account</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Full name" defaultValue="Aarav Rao" />
            <Field label="Email" type="email" defaultValue="aarav@aquasense.ai" />
            <Field label="Department" defaultValue="Water Operations" />
            <Field label="Phone" defaultValue="+91 90000 12345" />
          </div>

          <div className="mt-8 mb-4 flex items-center gap-2 text-lg font-semibold">
            <Lock className="h-4 w-4" /> Change password
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Current" type="password" />
            <Field label="New" type="password" />
            <Field label="Confirm" type="password" />
          </div>

          <div className="mt-8 mb-4 text-lg font-semibold">Notification preferences</div>
          <div className="space-y-3">
            <Toggle label="Critical leak alerts" defaultChecked />
            <Toggle label="Maintenance reminders" defaultChecked />
            <Toggle label="Weekly analytics digest" />
            <Toggle label="System announcements" defaultChecked />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="rounded-full">
              Cancel
            </Button>
            <Button className="rounded-full gradient-primary text-white">Save changes</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </li>
  );
}
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <Input
        {...props}
        className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
      />
    </label>
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
