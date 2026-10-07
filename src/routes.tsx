import type { ReactNode } from "react";

export type RouteDefinition = { path: string; label: string; element: ReactNode };

export const routes: RouteDefinition[] = [
  { path: "/devices", label: "Company iPhones", element: null },
  { path: "/accounts", label: "Social Media Accounts", element: null },
];
