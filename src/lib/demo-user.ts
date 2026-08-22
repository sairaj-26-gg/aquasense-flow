import { useEffect, useState } from "react";

export type DemoUser = {
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
};

export const DEFAULT_USER: DemoUser = {
  name: "Aarav Rao",
  email: "aarav@aquasense.ai",
  role: "Admin · Engineer",
  department: "Water Operations",
  phone: "+91 90000 12345",
};

const KEY = "aquasense.demo.user";
const EVENT = "aquasense:user-changed";

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function readDemoUser(): DemoUser {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_USER;
    return { ...DEFAULT_USER, ...(JSON.parse(raw) as Partial<DemoUser>) };
  } catch {
    return DEFAULT_USER;
  }
}

export function saveDemoUser(user: Partial<DemoUser>) {
  if (typeof window === "undefined") return;
  const next = { ...readDemoUser(), ...user };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Hydration-safe: renders the default user on the server, then syncs. */
export function useDemoUser(): DemoUser {
  const [user, setUser] = useState<DemoUser>(DEFAULT_USER);

  useEffect(() => {
    const sync = () => setUser(readDemoUser());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}
