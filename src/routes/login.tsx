import { createFileRoute, Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · AquaSense AI" },
      { name: "description", content: "Sign in to your AquaSense AI water intelligence workspace." },
      { property: "og:title", content: "Sign in · AquaSense AI" },
      { property: "og:description", content: "Access the AquaSense AI dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="neo-card-lg w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-glow)]">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Welcome back</div>
            <div className="text-xs text-muted-foreground">Sign in to AquaSense AI</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
            <Input
              type="email"
              defaultValue="aarav@aquasense.ai"
              className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
            <Input
              type="password"
              defaultValue="••••••••"
              className="rounded-xl border-none bg-secondary/60 shadow-[var(--shadow-neo-inset)]"
            />
          </div>

          <Button asChild className="w-full rounded-full gradient-primary text-white">
            <Link to="/">Enter dashboard</Link>
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-primary">
              Forgot password?
            </Link>
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
