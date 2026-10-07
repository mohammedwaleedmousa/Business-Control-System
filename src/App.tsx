import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppShell } from "./components/AppShell";
import { AuthScreen } from "./components/AuthScreen";
import { routes } from "./routes";
import { supabase } from "./lib/supabase";
import { AccountsPage } from "./components/AccountsPage";
import { DevicesPage } from "./components/DevicesPage";

type Profile = { id: string; full_name: string | null; role: "admin" | "manager" | "operator" | "viewer"; status: "active" | "inactive" };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [profileReady, setProfileReady] = useState(!supabase);
  const [profileError, setProfileError] = useState("");
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setAuthReady(true); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user.id) {
      setProfile(null); setProfileReady(!session); setProfileError(""); return;
    }
    let active = true;
    setProfileReady(false); setProfileError("");
    supabase.from("profiles").select("id, full_name, role, status").eq("id", session.user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) setProfileError(error.message); else setProfile(data as Profile | null);
      setProfileReady(true);
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const currentRoute = useMemo(() => routes.find((route) => route.path === path) ?? routes[0], [path]);
  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  const shell = (content: React.ReactNode) => (
    <AppShell
      currentPath={currentRoute.path}
      userName={profile?.full_name || session?.user.email || undefined}
      role={profile?.role}
      onNavigate={navigate}
      onSignOut={() => supabase?.auth.signOut()}
    >
      {content}
    </AppShell>
  );

  if (!authReady) return shell(<div className="loading-state">جارٍ التحقق من تسجيل الدخول…</div>);
  if (!session) return shell(<AuthScreen />);
  if (!profileReady) return shell(<div className="loading-state">جارٍ تحميل الملف الشخصي…</div>);
  if (profileError || !profile) return shell(
    <section className="page-placeholder">
      <p className="eyebrow">BCS</p>
      <h1>الملف الشخصي غير متاح</h1>
      <p>{profileError || "لم يتم تجهيز ملف BCS الخاص بك بعد."}</p>
    </section>
  );

  if (currentRoute.path === "/accounts") {
    return shell(<AccountsPage userId={session.user.id} role={profile.role} canManage={profile.role === "admin"} />);
  }
  return shell(<DevicesPage userId={session.user.id} role={profile.role} canManage={profile.role === "admin"} />);
}
