import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./components/AppShell";
import { AuthScreen } from "./components/AuthScreen";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { routes } from "./routes";
import { config } from "./config/env";
import { supabase } from "./lib/supabase";
import { DigitalAssetsPage } from "./components/DigitalAssetsPage";
import { AccountsPage } from "./components/AccountsPage";
import { SocialPlatformsPage } from "./components/SocialPlatformsPage";
import { DevicesPage } from "./components/DevicesPage";
import { BitwardenRefsPage } from "./components/BitwardenRefsPage";
import { DashboardPage } from "./components/DashboardPage";
import { BusinessesPage } from "./components/BusinessesPage";

type Business = {
  id: string;
  name: string;
  slug: string;
  code: string;
  status: "active" | "inactive";
};

type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "manager" | "operator" | "viewer";
  status: "active" | "inactive";
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [profileReady, setProfileReady] = useState(!supabase);
  const [profileError, setProfileError] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user.id) {
      setProfile(null);
      setProfileReady(!session);
      setProfileError("");
      return;
    }

    let active = true;
    setProfileReady(false);
    setProfileError("");

    supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setProfileError(error.message);
        } else {
          setProfile(data as Profile | null);
        }
        setProfileReady(true);
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session?.user.id) {
      setBusinesses([]);
      return;
    }
    let active = true;
    supabase.from("businesses").select("id, name, slug, code, status").order("name").then(({ data, error }) => {
      if (!active) return;
      if (!error) setBusinesses((data ?? []) as Business[]);
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session?.user.id || profile?.role !== "admin") {
      setUserCount(0);
      return;
    }
    let active = true;
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (active) setUserCount(count ?? 0);
    });
    return () => { active = false; };
  }, [session, profile?.role]);

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

  if (!profileReady) {
    return <AppShell><div className="loading-state">Loading profile…</div></AppShell>;
  }

  if (profileError || !profile) {
    return (
      <AppShell>
        <section className="page-placeholder">
          <p className="eyebrow">BCS</p>
          <h1>Profile unavailable</h1>
          <p>{profileError || "Your BCS profile has not been provisioned yet."}</p>
        </section>
      </AppShell>
    );
  }

  if (currentRoute.path === "/") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <nav className="navigation" aria-label="Primary">
          {routes.map((route) => (
            <button key={route.path} type="button" className={route.path === currentRoute.path ? "nav-item active" : "nav-item"} onClick={() => navigate(route.path)}>{route.label}</button>
          ))}
        </nav>
        <DashboardPage />
      </AppShell>
    );
  }

  if (currentRoute.path === "/businesses") {
    return (
      <AppShell>
        <div className="session-bar"><span>{profile.full_name || session.user.email}</span><span>{profile.role}</span><button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div>
        <nav className="navigation" aria-label="Primary">{routes.map((route) => <button key={route.path} type="button" className={route.path === currentRoute.path ? "nav-item active" : "nav-item"} onClick={() => navigate(route.path)}>{route.label}</button>)}</nav>
        <BusinessesPage canManage={profile.role === "admin"} />
      </AppShell>
    );
  }

  if (currentRoute.path === "/platforms") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <SocialPlatformsPage />
      </AppShell>
    );
  }

  if (currentRoute.path === "/accounts") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <AccountsPage canManage={profile.role === "admin"} />
      </AppShell>
    );
  }

  if (currentRoute.path === "/devices") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <DevicesPage />
      </AppShell>
    );
  }

  if (currentRoute.path === "/bitwarden") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <BitwardenRefsPage />
      </AppShell>
    );
  }

  if (currentRoute.path === "/assets") {
    return (
      <AppShell>
        <div className="session-bar">
          <span>{profile.full_name || session.user.email}</span>
          <span>{profile.role}</span>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
        <DigitalAssetsPage canManage={profile.role === "admin"} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="session-bar">
        <span>{profile.full_name || session.user.email}</span>
        <span>{profile.role} · {businesses.length} businesses{profile.role === "admin" ? ` · ${userCount} users` : ""}</span>
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
