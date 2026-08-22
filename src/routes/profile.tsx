import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Lock, Mail, Building2, Shield } from "lucide-react";
import { toast } from "sonner";
import { clearDemoUser, initials, saveDemoUser, useDemoUser } from "@/lib/demo-user";

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
  const navigate = useNavigate();
  const user = useDemoUser();
  const [form, setForm] = useState(user);

  useEffect(() => setForm(user), [user]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    saveDemoUser({ ...form, name: form.name.trim(), email: form.email.trim() });
    toast.success("Profile updated");
  };

  const handleLogout = () => {
    clearDemoUser();
    toast.success("Signed out", { description: "You have been logged out of AquaSense AI." });
    navigate({ to: "/login", replace: true });
  };

  return (
    <PageShell title="Profile" subtitle="Manage your identity and preferences.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="neo-card-lg p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white shadow-[var(--shadow-glow)]">
              {initials(user.name)}
            </div>
            <div className="mt-4 text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.department}</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              {user.role.split("·").map((r) => (
                <span key={r} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {r.trim()}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={Building2} label="Department" value={user.department} />
            <Row icon={Shield} label="Role" value={user.role} />
          </ul>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="neo-card-lg p-6 lg:col-span-2">
          <div className="mb-4 text-lg font-semibold">Account</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={set("name")} />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} />
            <Field label="Department" value={form.department} onChange={set("department")} />
            <Field label="Phone" value={form.phone} onChange={set("phone")} />
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
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setForm(user)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-full gradient-primary text-white"
            >
              Save changes
            </Button>
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
