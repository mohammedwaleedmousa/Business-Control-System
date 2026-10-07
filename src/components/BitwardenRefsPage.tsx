import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type BitwardenRef = {
  id: string;
  business_id: string;
  item_name: string;
  item_reference: string;
  notes: string | null;
};

export function BitwardenRefsPage() {
  const [refs, setRefs] = useState<BitwardenRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    supabase
      .from("bitwarden_refs")
      .select("id, business_id, item_name, item_reference, notes")
      .order("item_name")
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setRefs((data ?? []) as BitwardenRef[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div>
          <p className="eyebrow">BCS</p>
          <h1>Bitwarden References</h1>
          <p>Secure vault references and operational metadata. Secret values remain in Bitwarden.</p>
        </div>
        <span className="data-count">{refs.length} references</span>
      </div>
      {loading && <div className="loading-state">Loading Bitwarden references…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && refs.length === 0 && (
        <div className="empty-state">No Bitwarden references have been registered yet.</div>
      )}
      {!loading && !error && refs.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Item name</th><th>Item reference</th><th>Notes</th></tr></thead>
            <tbody>
              {refs.map((ref) => (
                <tr key={ref.id}>
                  <td><strong>{ref.item_name}</strong></td>
                  <td>{ref.item_reference}</td>
                  <td>{ref.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
