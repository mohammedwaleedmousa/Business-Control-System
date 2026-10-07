import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Device = {
  id: string;
  business_id: string;
  name: string;
  device_type: string;
  serial_number: string | null;
  asset_tag: string | null;
  status: "active" | "inactive" | "maintenance" | "retired";
  assigned_user_id: string | null;
};

type Business = { id: string; name: string; code: string };
type UserProfile = { id: string; full_name: string | null; role: string; status: string };

type Props = { canManage: boolean };

const deviceStatuses = ["active", "inactive", "maintenance", "retired"] as const;

export function DevicesPage({ canManage }: Props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formBusiness, setFormBusiness] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formAssetTag, setFormAssetTag] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formStatus, setFormStatus] = useState<(typeof deviceStatuses)[number]>("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  async function loadData() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    setError("");
    const [deviceResult, businessResult, userResult] = await Promise.all([
      supabase.from("devices").select("id, business_id, name, device_type, serial_number, asset_tag, status, assigned_user_id").order("name"),
      supabase.from("businesses").select("id, name, code").eq("status", "active").order("name"),
      supabase.from("profiles").select("id, full_name, role, status").eq("status", "active").order("full_name"),
    ]);
    const firstError = [deviceResult.error, businessResult.error, userResult.error].find(Boolean);
    if (firstError) setError(firstError.message);
    else {
      setDevices((deviceResult.data ?? []) as Device[]);
      setBusinesses((businessResult.data ?? []) as Business[]);
      setUsers((userResult.data ?? []) as UserProfile[]);
    }
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  const businessMap = useMemo(() => new Map(businesses.map((b) => [b.id, b])), [businesses]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const types = useMemo(() => Array.from(new Set(devices.map((d) => d.device_type))).sort(), [devices]);

  const filteredDevices = devices.filter((device) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [device.name, device.device_type, device.serial_number, device.asset_tag].some((value) => value?.toLowerCase().includes(q));
    return matchesSearch && (!businessFilter || device.business_id === businessFilter) && (!statusFilter || device.status === statusFilter) && (!typeFilter || device.device_type === typeFilter);
  });

  function resetForm() {
    setFormBusiness(businesses[0]?.id ?? "");
    setFormName(""); setFormType(""); setFormSerial(""); setFormAssetTag(""); setFormUser(""); setFormStatus("active"); setSaveError("");
  }

  async function createDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !canManage) return;
    setSaving(true); setSaveError("");
    const { error: insertError } = await supabase.from("devices").insert({
      business_id: formBusiness, name: formName.trim(), device_type: formType.trim(),
      serial_number: formSerial.trim() || null, asset_tag: formAssetTag.trim() || null,
      status: formStatus, assigned_user_id: formUser || null,
    });
    if (insertError) setSaveError(insertError.message);
    else { setShowForm(false); resetForm(); await loadData(); }
    setSaving(false);
  }

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div><p className="eyebrow">BCS</p><h1>Devices</h1><p>Business-owned device records and operational assignment metadata.</p></div>
        <div className="data-page-actions">
          <span className="data-count">{filteredDevices.length} of {devices.length} devices</span>
          {canManage && <button type="button" className="primary-button" onClick={() => { resetForm(); setShowForm((v) => !v); }}>{showForm ? "Close" : "Add device"}</button>}
        </div>
      </div>

      {canManage && showForm && (
        <form className="inline-form" onSubmit={createDevice}>
          <label>Business<select value={formBusiness} onChange={(e) => setFormBusiness(e.target.value)} required><option value="">Select business</option>{businesses.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}</select></label>
          <label>Name<input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Device name" required /></label>
          <label>Device type<input value={formType} onChange={(e) => setFormType(e.target.value)} placeholder="Laptop, phone, tablet…" required /></label>
          <label>Serial number<input value={formSerial} onChange={(e) => setFormSerial(e.target.value)} /></label>
          <label>Asset tag<input value={formAssetTag} onChange={(e) => setFormAssetTag(e.target.value)} /></label>
          <label>Assigned user<select value={formUser} onChange={(e) => setFormUser(e.target.value)}><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.id.slice(0, 8)} · {u.role}</option>)}</select></label>
          <label>Status<select value={formStatus} onChange={(e) => setFormStatus(e.target.value as (typeof deviceStatuses)[number])}>{deviceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          {saveError && <p className="auth-error" role="alert">{saveError}</p>}
          <div className="form-actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save device"}</button><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>
      )}

      <div className="filter-bar">
        <input aria-label="Search devices" placeholder="Search devices…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter by business" value={businessFilter} onChange={(e) => setBusinessFilter(e.target.value)}><option value="">All businesses</option>{businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All statuses</option>{deviceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        <select aria-label="Filter by device type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">All types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select>
      </div>

      {loading && <div className="loading-state">Loading devices…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && filteredDevices.length === 0 && <div className="empty-state">{devices.length === 0 ? "No devices have been registered yet." : "No devices match the current filters."}</div>}
      {!loading && !error && filteredDevices.length > 0 && (
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Business</th><th>Type</th><th>Serial number</th><th>Asset tag</th><th>Assigned user</th><th>Status</th></tr></thead><tbody>
          {filteredDevices.map((device) => <tr key={device.id}><td><strong>{device.name}</strong></td><td>{businessMap.get(device.business_id)?.name || "—"}</td><td>{device.device_type}</td><td>{device.serial_number || "—"}</td><td>{device.asset_tag || "—"}</td><td>{device.assigned_user_id ? (userMap.get(device.assigned_user_id)?.full_name || "Assigned") : "Unassigned"}</td><td><span className={`status-badge status-${device.status}`}>{device.status}</span></td></tr>)}
        </tbody></table></div>
      )}
    </section>
  );
}
