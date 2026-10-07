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
  "/device-apps": "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
};

const roleLabels: Record<string, string> = {
  admin: "مسؤول إداري",
  manager: "مدير",
  operator: "مشغّل",
  viewer: "مستخدم للعرض",
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
      <aside className="sidebar" dir="rtl">
        <div className="sidebar-brand">
          <div className="brand-symbol">ب</div>
          <div><strong>نظام التحكم بالأعمال</strong><span>إدارة الأعمال الداخلية</span></div>
        </div>
        {authenticated && (
          <>
            <div className="sidebar-label">مساحة العمل</div>
            <nav className="sidebar-nav" aria-label="التنقل الرئيسي">
              {routes.map((route) => (
                <button key={route.path} className={route.path === currentPath ? "sidebar-link active" : "sidebar-link"} onClick={() => go(route.path)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[route.path]} /></svg>
                  <span>{route.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-spacer" />
            <div className="sidebar-user">
              <div className="avatar">{(userName || "م").charAt(0).toUpperCase()}</div>
              <div className="user-meta"><strong>{userName}</strong><span>{roleLabels[role ?? ""] ?? role ?? "مستخدم"}</span></div>
              <button className="signout-icon" onClick={onSignOut} aria-label="تسجيل الخروج">↗</button>
            </div>
          </>
        )}
      </aside>
      <div className="main-shell">
        {authenticated && (
          <header className="topbar" dir="rtl">
            <div className="breadcrumb"><span>الرئيسية</span><b>/</b><strong>{routes.find((route) => route.path === currentPath)?.label ?? "الرئيسية"}</strong></div>
            <div className="topbar-status"><span className="live-dot" /> النظام يعمل بشكل طبيعي</div>
          </header>
        )}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
