import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./components/AppShell";
import { AuthScreen } from "./components/AuthScreen";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { routes } from "./routes";
import { config } from "./config/env";
import { supabase } from "./lib/supabase";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setAuthReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const currentRoute = useMemo(
    () => routes.find((route) => route.path === path) ?? routes[0],
    [path],
  );

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  if (!authReady) {
    return <AppShell><div className="loading-state">Loading authentication…</div></AppShell>;
  }

  if (!session) {
    return <AppShell><AuthScreen /></AppShell>;
  }

  return (
    <AppShell>
      <div className="session-bar">
        <span>{session.user.email}</span>
        <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
      </div>
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
