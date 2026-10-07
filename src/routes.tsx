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
  { path: "/bitwarden", label: "Bitwarden References", element: null },
  { path: "/users", label: "Users", element: null },
  { path: "/activity", label: "Activity", element: null },
  { path: "/settings", label: "Settings", element: null },
  { path: "/locations", label: "Locations", element: null },
  { path: "/departments", label: "Departments", element: null },
  { path: "/contacts", label: "Contacts", element: null },
  { path: "/vendors", label: "Vendors", element: null },
  { path: "/projects", label: "Projects", element: null },
  { path: "/tasks", label: "Tasks", element: null },
  { path: "/inventory", label: "Inventory", element: null },
  { path: "/subscriptions", label: "Subscriptions", element: null },
  { path: "/documents", label: "Documents", element: null },
  { path: "/incidents", label: "Incidents", element: null },
  { path: "/approvals", label: "Approvals", element: null },
];