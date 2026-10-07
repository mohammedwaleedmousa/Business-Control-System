import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./components/AppShell";
import { AuthScreen } from "./components/AuthScreen";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { routes } from "./routes";
import { supabase } from "./lib/supabase";
import { DigitalAssetsPage } from "./components/DigitalAssetsPage";
import { AccountsPage } from "./components/AccountsPage";
import { SocialPlatformsPage } from "./components/SocialPlatformsPage";
import { DevicesPage } from "./components/DevicesPage";
import { BitwardenRefsPage } from "./components/BitwardenRefsPage";
import { DashboardPage } from "./components/DashboardPage";
import { BusinessesPage } from "./components/BusinessesPage";
import { UsersPage } from "./components/UsersPage";
import { ActivityPage } from "./components/ActivityPage";
import { SettingsPage } from "./components/SettingsPage";

type Business = { id: string; name: string; slug: string; code: string; status: "active" | "inactive" };
type Profile = { id: string; full_name: string | null; role: "admin" | "manager" | "operator" | "viewer"; status: "active" | "inactive" };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [profileReady, setProfileReady] = useState(!supabase);
  const [profileError, setProfileError] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setAuthReady(true); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user.id) { setProfile(null); setProfileReady(!session); setProfileError(""); return; }
    let active = true; setProfileReady(false); setProfileError("");
    supabase.from("profiles").select("id, full_name, role, status").eq("id", session.user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setProfileError(error.message); else setProfile(data as Profile | null);
      setProfileReady(true);
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session?.user.id) { setBusinesses([]); return; }
    let active = true;
    supabase.from("businesses").select("id, name, slug, code, status").order("name").then(({ data }) => { if (active) setBusinesses((data ?? []) as Business[]); });
    return () => { active = false; };
  }, [session]);

  const currentRoute = useMemo(() => routes.find((route) => route.path === path) ?? routes[0], [path]);
  function navigate(nextPath: string) { window.history.pushState({}, "", nextPath); setPath(nextPath); }

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const shell = (content: React.ReactNode) => (
    <AppShell currentPath={currentRoute.path} userName={profile?.full_name || session?.user.email || undefined} role={profile?.role} onNavigate={navigate} onSignOut={() => supabase?.auth.signOut()}>
      {content}
    </AppShell>
  );

  if (!authReady) return shell(<div className="loading-state">Loading authentication…</div>);
  if (!session) return shell(<AuthScreen />);
  if (!profileReady) return shell(<div className="loading-state">Loading profile…</div>);
  if (profileError || !profile) return shell(<section className="page-placeholder"><p className="eyebrow">BCS</p><h1>Profile unavailable</h1><p>{profileError || "Your BCS profile has not been provisioned yet."}</p></section>);

  if (currentRoute.path === "/") return shell(<DashboardPage />);
  if (currentRoute.path === "/businesses") return shell(<BusinessesPage canManage={profile.role === "admin"} />);
  if (currentRoute.path === "/platforms") return shell(<SocialPlatformsPage />);
  if (currentRoute.path === "/accounts") return shell(<AccountsPage canManage={profile.role === "admin"} />);
  if (currentRoute.path === "/devices") return shell(<DevicesPage canManage={profile.role === "admin"} />);
  if (currentRoute.path === "/bitwarden") return shell(<BitwardenRefsPage />);
  if (currentRoute.path === "/assets") return shell(<DigitalAssetsPage canManage={profile.role === "admin"} />);
  if (currentRoute.path === "/users") return shell(<UsersPage />);
  if (currentRoute.path === "/activity") return shell(<ActivityPage />);
  if (currentRoute.path === "/settings") return shell(<SettingsPage />);
  if (currentRoute.path === "/locations") return shell(<PagePlaceholder title="Locations" description="Manage physical locations, branches, offices, storage areas, and operational sites." />);
  if (currentRoute.path === "/departments") return shell(<PagePlaceholder title="Departments" description="Manage departments, ownership, managers, and organizational structure." />);
  if (currentRoute.path === "/contacts") return shell(<PagePlaceholder title="Contacts" description="Centralize customers, suppliers, partners, staff contacts, and business relationships." />);
  if (currentRoute.path === "/vendors") return shell(<PagePlaceholder title="Vendors" description="Manage suppliers, service providers, contacts, status, and operational notes." />);
  if (currentRoute.path === "/projects") return shell(<PagePlaceholder title="Projects" description="Plan projects, ownership, priorities, milestones, deadlines, and delivery status." />);
  if (currentRoute.path === "/tasks") return shell(<PagePlaceholder title="Tasks" description="Track operational tasks, assignments, priorities, deadlines, blockers, and completion." />);
  if (currentRoute.path === "/inventory") return shell(<PagePlaceholder title="Inventory" description="Manage stock, SKUs, quantities, reorder levels, locations, and inventory movements." />);
  if (currentRoute.path === "/subscriptions") return shell(<PagePlaceholder title="Subscriptions" description="Track software, services, plans, renewals, costs, owners, and secure vault references." />);
  if (currentRoute.path === "/documents") return shell(<PagePlaceholder title="Documents" description="Manage operational documents, versions, owners, status, and storage references." />);
  if (currentRoute.path === "/incidents") return shell(<PagePlaceholder title="Incidents" description="Track operational incidents, severity, ownership, investigation, resolution, and closure." />);
  if (currentRoute.path === "/approvals") return shell(<PagePlaceholder title="Approvals" description="Manage approval requests, approvers, decisions, notes, and decision history." />);
  return shell(<PagePlaceholder title={currentRoute.label} description="BCS operational controls are being connected to this workspace." />);
}