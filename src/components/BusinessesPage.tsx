import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Business = { id: string; name: string; slug: string; code: string; status: "active" | "inactive" };

export function BusinessesPage({ canManage }: { canManage: boolean }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) { setLoading(false); setError("Supabase is not configured."); return; }
    setLoading(true);
    const { data, error: queryError } = await supabase.from("businesses").select("id, name, slug, code, status").order("name");
    if (queryError) setError(queryError.message);
    else setBusinesses((data ?? []) as Business[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => businesses.filter((business) => {
    const matchesSearch = [business.name, business.code, business.slug].some((value) => value.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch && (status === "all" || business.status === status);
  }), [businesses, search, status]);

  async function createBusiness(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !canManage) return;
    setSaving(true); setError("");
    const normalizedCode = code.trim().toUpperCase();
    const normalizedSlug = slug.trim().toLowerCase();
    const { error: insertError } = await supabase.from("businesses").insert({
      name: name.trim(), code: normalizedCode, slug: normalizedSlug,
    });
    if (insertError) setError(insertError.message);
    else {
      setName(""); setCode(""); setSlug(""); setShowForm(false);
      await load();
    }
    setSaving(false);
  }

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div><p className="eyebrow">BCS · CORE</p><h1>Businesses</h1><p>Manage the business registry and operational status.</p></div>
        <div className="header-actions"><span className="data-count">{filtered.length} shown</span>{canManage && <button className="primary-action" type="button" onClick={() => setShowForm((value) => !value)}>{showForm ? "Cancel" : "Add business"}</button>}</div>
      </div>

      {canManage && showForm && (
        <form className="inline-form" onSubmit={createBusiness}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" required /></label>
          <label>Code<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE" required /></label>
          <label>Slug<input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="business-slug" required /></label>
          <button className="primary-action" type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
        </form>
      )}

      <div className="filter-bar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses…" aria-label="Search businesses" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>

      {loading && <div className="loading-state">Loading businesses…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && filtered.length === 0 && <div className="empty-state">No businesses match the current filters.</div>}
      {!loading && !error && filtered.length > 0 && (
        <div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>Name</th><th>Code</th><th>Slug</th><th>Status</th></tr></thead>
          <tbody>{filtered.map((business) => <tr key={business.id}><td><strong>{business.name}</strong></td><td>{business.code}</td><td>{business.slug}</td><td><span className="status-badge">{business.status}</span></td></tr>)}</tbody>
        </table></div>
      )}
    </section>
  );
}
