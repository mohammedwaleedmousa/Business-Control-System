import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="brand-mark">BCS</span>
          <span className="brand-name">Business Control System</span>
        </div>
        <span className="environment-badge">Foundation</span>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}