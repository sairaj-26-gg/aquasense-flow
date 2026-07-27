import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Bell, Search } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-primary px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full gradient-primary px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AquaSense AI · Smart Water. Smarter Cities." },
      {
        name: "description",
        content:
          "AquaSense AI monitors water pipelines in real time, detects leaks, predicts failures, and streamlines maintenance for municipalities and industries.",
      },
      { name: "author", content: "AquaSense AI" },
      { property: "og:title", content: "AquaSense AI · Smart Water. Smarter Cities." },
      {
        property: "og:description",
        content:
          "Real-time water pipeline monitoring, AI leak prediction, interactive heat maps and maintenance workflows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-md md:px-8">
              <SidebarTrigger className="rounded-xl" />
              <div className="hidden flex-1 items-center md:flex">
                <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-muted-foreground shadow-[var(--shadow-neo-inset)]">
                  <Search className="h-4 w-4" />
                  <span>Search pipelines, zones, engineers…</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--shadow-neo-sm)]"
                >
                  <Bell className="h-4 w-4 text-foreground/80" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-health-crit)]" />
                </button>
                <div className="hidden items-center gap-3 rounded-full bg-card px-3 py-1.5 shadow-[var(--shadow-neo-sm)] md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white">
                    AR
                  </div>
                  <div className="pr-1 leading-tight">
                    <div className="text-xs font-semibold">Aarav R.</div>
                    <div className="text-[10px] text-muted-foreground">Admin · Engineer</div>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}
