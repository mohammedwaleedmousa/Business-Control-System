import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Account = {
  id: string;
  business_id: string;
  name: string;
  handle: string | null;
  contact_email: string | null;
  status: "active" | "inactive" | "suspended";
  platform: { name: string } | null;
};

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase
      .from("accounts")
      .select("id, business_id, name, handle, contact_email, status, platform:social_platforms(name)")
      .order("name")
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setAccounts((data ?? []) as Account[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div>
          <p className="eyebrow">BCS</p>
          <h1>Accounts</h1>
          <p>Operational account records with platform and ownership metadata.</p>
        </div>
        <span className="data-count">{accounts.length} accounts</span>
      </div>
      {loading && <div className="loading-state">Loading accounts…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && accounts.length === 0 && (
        <div className="empty-state">No accounts have been registered yet.</div>
      )}
      {!loading && !error && accounts.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Platform</th><th>Handle</th><th>Contact</th><th>Status</th></tr></thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td><strong>{account.name}</strong></td>
                  <td>{account.platform?.name || "—"}</td>
                  <td>{account.handle || "—"}</td>
                  <td>{account.contact_email || "—"}</td>
                  <td><span className={`status-badge status-${account.status}`}>{account.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
