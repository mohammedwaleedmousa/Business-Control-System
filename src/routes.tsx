import type { ReactNode } from "react";

export type RouteDefinition = { path: string; label: string; element: ReactNode };

export const routes: RouteDefinition[] = [
  { path: "/devices", label: "هواتف الشركة", element: null },
  { path: "/accounts", label: "حسابات التواصل الاجتماعي", element: null },
];
