import { useEffect, useState } from "react";
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

export function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase
      .from("devices")
      .select("id, business_id, name, device_type, serial_number, asset_tag, status, assigned_user_id")
      .order("name")
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(queryError.message);
        else setDevices((data ?? []) as Device[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="data-page">
      <div className="data-page-header">
        <div>
          <p className="eyebrow">BCS</p>
          <h1>Devices</h1>
          <p>Business-owned device records and operational assignment metadata.</p>
        </div>
        <span className="data-count">{devices.length} devices</span>
      </div>
      {loading && <div className="loading-state">Loading devices…</div>}
      {!loading && error && <p className="auth-error" role="alert">{error}</p>}
      {!loading && !error && devices.length === 0 && (
        <div className="empty-state">No devices have been registered yet.</div>
      )}
      {!loading && !error && devices.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Serial number</th><th>Asset tag</th><th>Status</th></tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td><strong>{device.name}</strong></td>
                  <td>{device.device_type}</td>
                  <td>{device.serial_number || "—"}</td>
                  <td>{device.asset_tag || "—"}</td>
                  <td><span className={`status-badge status-${device.status}`}>{device.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
