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
  "/devices": "M7 3h10v18H7zM10 6h4M10 18h4",
  "/accounts": "M4 6h16v12H4zM8 10h8M8 14h5",
};

export function AppShell({ children, currentPath = "/devices", userName, role, onNavigate, onSignOut }: AppShellProps) {
  const authenticated = Boolean(userName);
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
              {routes.map((route) => (
                <button key={route.path} className={route.path === currentPath ? "sidebar-link active" : "sidebar-link"} onClick={() => go(route.path)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[route.path]} /></svg>
                  <span>{route.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-spacer" />
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
            <div className="breadcrumb"><span>BCS</span><b>/</b><strong>{routes.find((r) => r.path === currentPath)?.label ?? "BCS"}</strong></div>
            <div className="topbar-status"><span className="live-dot" /> System operational</div>
          </header>
        )}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
