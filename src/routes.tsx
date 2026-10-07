import type { ReactNode } from "react";

export type RouteDefinition = {
  path: string;
  label: string;
  element: ReactNode;
};

export const routes: RouteDefinition[] = [
  { path: "/", label: "Dashboard", element: null },
  { path: "/businesses", label: "Businesses", element: null },
  { path: "/assets", label: "Digital Assets", element: null },
  { path: "/accounts", label: "Accounts", element: null },
  { path: "/platforms", label: "Social Platforms", element: null },
  { path: "/devices", label: "Devices", element: null },
  { path: "/users", label: "Users", element: null },
  { path: "/activity", label: "Activity", element: null },
  { path: "/settings", label: "Settings", element: null },
];