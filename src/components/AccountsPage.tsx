import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Account = { id: string; business_id: string; name: string; handle: string | null; contact_email: string | null; status: "active" | "inactive" | "suspended"; platform: { name: string }[] | null };
type Business = { id: string; name: string };
type Platform = { id: string; name: string };

export function AccountsPage({ canManage }: { canManage: boolean }) {
  const [accounts, setAccounts] = useState<Account[]>([]), [businesses, setBusinesses] = useState<Business[]>([]), [platforms, setPlatforms] = useState<Platform[]>([]);
  const [search, setSearch] = useState(""), [status, setStatus] = useState("all"), [businessId, setBusinessId] = useState("all"), [platformId, setPlatformId] = useState("all");
  const [showForm, setShowForm] = useState(false), [name, setName] = useState(""), [handle, setHandle] = useState(""), [contactEmail, setContactEmail] = useState(""), [newBusinessId, setNewBusinessId] = useState(""), [newPlatformId, setNewPlatformId] = useState("");
  const [saving, setSaving] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");

  async function load() {
    if (!supabase) { setLoading(false); setError("Supabase is not configured."); return; }
    setLoading(true);
    const [a,b,p] = await Promise.all([
      supabase.from("accounts").select("id, business_id, name, handle, contact_email, status, platform:social_platforms(name)").order("name"),
      supabase.from("businesses").select("id, name").order("name"),
      supabase.from("social_platforms").select("id, name").eq("active", true).order("name"),
    ]);
    if (a.error) setError(a.error.message); else setAccounts((a.data ?? []) as Account[]);
    if (!b.error) setBusinesses((b.data ?? []) as Business[]);
    if (!p.error) setPlatforms((p.data ?? []) as Platform[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => accounts.filter(a => {
    const q=search.toLowerCase();
    const platformName=a.platform?.[0]?.name ?? "";
    return [a.name,a.handle??"",a.contact_email??"",platformName].some(v=>v.toLowerCase().includes(q))
      && (status==="all"||a.status===status) && (businessId==="all"||a.business_id===businessId);
  }), [accounts,search,status,businessId]);
  async function create(e: FormEvent) {
    e.preventDefault(); if (!supabase || !canManage) return; setSaving(true); setError("");
    const {error:insertError}=await supabase.from("accounts").insert({business_id:newBusinessId,platform_id:newPlatformId||null,name:name.trim(),handle:handle.trim()||null,contact_email:contactEmail.trim()||null});
    if(insertError)setError(insertError.message); else {setName("");setHandle("");setContactEmail("");setNewBusinessId("");setNewPlatformId("");setShowForm(false);await load();} setSaving(false);
  }
  return <section className="data-page">
    <div className="data-page-header"><div><p className="eyebrow">BCS · CORE</p><h1>Accounts</h1><p>Operational account records with platform, business, and contact metadata.</p></div><div className="header-actions"><span className="data-count">{filtered.length} shown</span>{canManage&&<button className="primary-action" type="button" onClick={()=>setShowForm(v=>!v)}>{showForm?"Cancel":"Add account"}</button>}</div></div>
    {canManage&&showForm&&<form className="inline-form" onSubmit={create}>
      <label>Business<select value={newBusinessId} onChange={e=>setNewBusinessId(e.target.value)} required><option value="">Select business</option>{businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label>Platform<select value={newPlatformId} onChange={e=>setNewPlatformId(e.target.value)}><option value="">No platform</option>{platforms.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Account name" required/></label>
      <label>Handle<input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@handle"/></label>
      <label>Contact email<input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="Optional"/></label>
      <button className="primary-action" type="submit" disabled={saving}>{saving?"Saving…":"Create"}</button>
    </form>}
    <div className="filter-bar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts…" aria-label="Search accounts"/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select><select value={businessId} onChange={e=>setBusinessId(e.target.value)}><option value="all">All businesses</option>{businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
    {loading&&<div className="loading-state">Loading accounts…</div>}{!loading&&error&&<p className="auth-error" role="alert">{error}</p>}{!loading&&!error&&!filtered.length&&<div className="empty-state">No accounts match the current filters.</div>}
    {!loading&&!error&&!!filtered.length&&<div className="data-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Business</th><th>Platform</th><th>Handle</th><th>Contact</th><th>Status</th></tr></thead><tbody>{filtered.map(a=><tr key={a.id}><td><strong>{a.name}</strong></td><td>{businesses.find(b=>b.id===a.business_id)?.name||"—"}</td><td>{a.platform?.[0]?.name||"—"}</td><td>{a.handle||"—"}</td><td>{a.contact_email||"—"}</td><td><span className={`status-badge status-${a.status}`}>{a.status}</span></td></tr>)}</tbody></table></div>}
  </section>;
}
