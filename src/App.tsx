import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { routes } from "./routes";
import { config } from "./config/env";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const currentRoute = useMemo(
    () => routes.find((route) => route.path === path) ?? routes[0],
    [path],
  );

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  return (
    <AppShell>
      <nav className="navigation" aria-label="Primary">
        {routes.map((route) => (
          <button
            key={route.path}
            type="button"
            className={route.path === currentRoute.path ? "nav-item active" : "nav-item"}
            onClick={() => navigate(route.path)}
          >
            {route.label}
          </button>
        ))}
      </nav>
      <PagePlaceholder
        title={currentRoute.label}
        description={`BCS architecture is being built incrementally for ${config.appName}. Business modules will be connected after the foundation is verified.`}
      />
    </AppShell>
  );
}
