import type { RouteDefinition } from "../types";

export const routeRegistry: RouteDefinition[] = [
  {
    id: "home",
    path: "/",
    aliases: ["main", "index", "start"],
    description: "The home page or dashboard",
  },
  {
    id: "invoices",
    path: "/invoices",
    aliases: ["billing", "payments", "money"],
    description: "Manage and view invoices",
  },
  {
    id: "settings",
    path: "/settings",
    aliases: ["preferences", "config", "options"],
    description: "User and system settings",
  },
  {
    id: "clients",
    path: "/clients",
    aliases: ["customers", "people", "users"],
    description: "View and manage clients",
  },
  {
    id: "reports",
    path: "/reports",
    aliases: ["analytics", "charts", "stats"],
    description: "View analytics and reports",
  },
  {
    id: "profile",
    path: "/settings/profile",
    aliases: ["my account", "me"],
    description: "User profile settings",
  },
];

export const getRoutePath = (id: string | null) => {
  if (!id) return null;
  return routeRegistry.find((r) => r.id === id)?.path || null;
};
