import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type DashboardStats = {
  businesses: number;
  accounts: number;
  assets: number;
  devices: number;
  platforms: number;
  activities: number;
};

type Business = { id: string; name: string; code: string; status: string };

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ businesses: 0, accounts: 0, assets: 0, devices: 0, platforms: 0, activities: 0 });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); setError("Supabase is not configured."); return; }
    let active = true;
    Promise.all([
      supabase.from("businesses").select("id, name, code, status"),
      supabase.from("accounts").select("id", { count: "exact", head: true }),
      supabase.from("digital_assets").select("id", { count: "exact", head: true }),
      supabase.from("devices").select("id", { count: "exact", head: true }),
      supabase.from("social_platforms").select("id", { count: "exact", head: true }),
      supabase.from("activity_logs").select("id", { count: "exact", head: true }),
    ]).then(([businessResult, accounts, assets, devices, platforms, activities]) => {
      if (!active) return;
      const firstError = [businessResult.error, accounts.error, assets.error, devices.error, platforms.error, activities.error].find(Boolean);
      if (firstError) {
        setError(firstError.message);
      } else {
        setBusinesses((businessResult.data ?? []) as Business[]);
        setStats({
          businesses: businessResult.data?.length ?? 0,
          accounts: accounts.count ?? 0,
          assets: assets.count ?? 0,
          devices: devices.count ?? 0,
          platforms: platforms.count ?? 0,
          activities: activities.count ?? 0,
        });
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">BCS OVERVIEW</p>
          <h1>Business Control System</h1>
          <p>Operational control for Genan Boutique and Flamingo Park.</p>
        </div>
      </div>

      {loading && <div className="loading-state">Loading dashboard…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="dashboard-stats">
            {[
              ["Businesses", stats.businesses],
              ["Accounts", stats.accounts],
              ["Digital assets", stats.assets],
              ["Devices", stats.devices],
              ["Platforms", stats.platforms],
              ["Activity events", stats.activities],
            ].map(([label, value]) => (
              <div className="stat-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="dashboard-section">
            <div className="section-heading">
              <div><p className="eyebrow">BUSINESS REGISTRY</p><h2>Businesses</h2></div>
            </div>
            <div className="business-grid">
              {businesses.map((business) => (
                <article className="business-card" key={business.id}>
                  <div><span className="business-code">{business.code}</span><span className="status-badge">{business.status}</span></div>
                  <h3>{business.name}</h3>
                  <p>Operational records are protected by business-scoped access.</p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
