import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Waves } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveDemoUser } from "@/lib/demo-user";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  engineer: "Engineer",
  viewer: "Viewer",
};

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account · AquaSense AI" },
      {
        name: "description",
        content:
          "Create your AquaSense AI workspace account to monitor pipelines, detect leaks and plan maintenance.",
      },
      { property: "og:title", content: "Create account · AquaSense AI" },
      {
        property: "og:description",
        content: "Set up your AquaSense AI water intelligence workspace in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("engineer");

  const handleCreate = () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.error("Check your details", {
        description: "Name, a valid email and a 6+ character password are required.",
      });
      return;
    }
    saveDemoUser({
      name: name.trim(),
      email: email.trim(),
      role: ROLE_LABELS[role] ?? "Engineer",
    });
    toast.success("Account created", {
      description: `Welcome to AquaSense AI, ${name.split(" ")[0]}. Demo workspace ready.`,
    });
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="neo-card-lg w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-glow)]">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Create your account</h1>
            <div className="text-xs text-muted-foreground">Join the AquaSense AI workspace</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name" className="text-xs uppercase tracking-wide text-muted-foreground">
              Full name
            </Label>
            <Input
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Rao"
              className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="text-xs uppercase tracking-wide text-muted-foreground">
              Work email
            </Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@utility.gov"
              className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="text-xs uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleCreate}
            className="w-full rounded-full gradient-primary text-white"
          >
            Create account
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
