import type { ReactNode } from "react";
import { routes } from "../routes";

type AppShellProps = {
  children: ReactNode;
  currentPath?: string;
  userName?: string;
  role?: string;
  onNavigate?: (path: string) => void;
  onSignOut?: () => void;
};

const icons: Record<string, string> = {
  "/": "M3 12 12 3l9 9M5 10v10h14V10M9 20v-6h6v6",
  "/businesses": "M4 5h16v14H4zM8 9h8M8 13h5",
  "/assets": "M4 6h6l2 2h8v10H4z",
  "/accounts": "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
  "/platforms": "M4 6h16v12H4zM8 10h.01M12 10h.01M16 10h.01",
  "/devices": "M7 3h10v18H7zM10 6h4M10 18h4",
  "/bitwarden": "M12 3 19 6v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6zM9 11h6",
  "/users": "M16 20v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 8a3 3 0 0 1 0 6M20 20v-1a3 3 0 0 0-2-2.8",
  "/activity": "M4 5h16v14H4zM8 9h8M8 13h5M8 17h7",
  "/settings": "M12 8a4 4 0 1 0 0 8 4 4 0 0 0-8M4 12h2m12 0h2M12 4v2m0 12v2",
};

export function AppShell({ children, currentPath = "/", userName, role, onNavigate, onSignOut }: AppShellProps) {
  const authenticated = Boolean(userName);
  const primary = routes.slice(0, 8);
  const secondary = routes.slice(8);

  function go(path: string) {
    if (onNavigate) onNavigate(path);
    else {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  return (
    <div className={authenticated ? "app-shell authenticated" : "app-shell"}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-symbol">B</div>
          <div><strong>BCS</strong><span>Business Control System</span></div>
        </div>
        {authenticated && (
          <>
            <div className="sidebar-label">Workspace</div>
            <nav className="sidebar-nav" aria-label="Primary">
              {primary.map((route) => (
                <button key={route.path} className={route.path === currentPath ? "sidebar-link active" : "sidebar-link"} onClick={() => go(route.path)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[route.path] ?? icons["/"]} /></svg>
                  <span>{route.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-spacer" />
            <div className="sidebar-label">System</div>
            <nav className="sidebar-nav">
              {secondary.map((route) => (
                <button key={route.path} className={route.path === currentPath ? "sidebar-link active" : "sidebar-link"} onClick={() => go(route.path)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[route.path] ?? icons["/"]} /></svg>
                  <span>{route.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-user">
              <div className="avatar">{(userName || "U").charAt(0).toUpperCase()}</div>
              <div className="user-meta"><strong>{userName}</strong><span>{role}</span></div>
              <button className="signout-icon" onClick={onSignOut} aria-label="Sign out">↗</button>
            </div>
          </>
        )}
      </aside>
      <div className="main-shell">
        {authenticated && (
          <header className="topbar">
            <div className="breadcrumb"><span>BCS</span><b>/</b><strong>{routes.find((r) => r.path === currentPath)?.label ?? "Overview"}</strong></div>
            <div className="topbar-status"><span className="live-dot" /> System operational</div>
          </header>
        )}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}