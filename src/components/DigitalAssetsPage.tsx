import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type DigitalAsset = {
  id: string;
  business_id: string;
  asset_type: string;
  name: string;
  identifier: string | null;
  status: "active" | "inactive" | "archived";
  notes: string | null;
};

export function DigitalAssetsPage() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase
      .from("digital_assets")
      .select("id, business_id, asset_type, name, identifier, status, notes")
      .order("name")
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setAssets((data ?? []) as DigitalAsset[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div>
          <p className="eyebrow">BCS</p>
          <h1>Digital Assets</h1>
          <p>Business-owned digital assets and their operational metadata.</p>
        </div>
        <span className="data-count">{assets.length} assets</span>
      </div>
      {loading && <div className="loading-state">Loading digital assets…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && assets.length === 0 && (
        <div className="empty-state">No digital assets have been registered yet.</div>
      )}
      {!loading && !error && assets.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Identifier</th><th>Status</th></tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td><strong>{asset.name}</strong></td>
                  <td>{asset.asset_type}</td>
                  <td>{asset.identifier || "—"}</td>
                  <td><span className={`status-badge status-${asset.status}`}>{asset.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
