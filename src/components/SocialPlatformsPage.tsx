import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Platform = { id: string; name: string; code: string; active: boolean };

export function SocialPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    supabase.from("social_platforms").select("id, name, code, active").order("name").then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setPlatforms((data ?? []) as Platform[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div><p className="eyebrow">BCS</p><h1>Social Platforms</h1><p>Supported platforms available for business accounts.</p></div>
        <span className="data-count">{platforms.length} platforms</span>
      </div>
      {loading && <div className="loading-state">Loading platforms…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && (
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Code</th><th>Status</th></tr></thead><tbody>
          {platforms.map((platform) => <tr key={platform.id}><td><strong>{platform.name}</strong></td><td>{platform.code}</td><td><span className={`status-badge status-${platform.active ? "active" : "inactive"}`}>{platform.active ? "active" : "inactive"}</span></td></tr>)}
        </tbody></table></div>
      )}
    </section>
  );
}
