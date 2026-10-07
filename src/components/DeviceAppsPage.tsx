import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Business = { id: string; name: string; code: string };
type ApprovedApp = { id: string; business_id: string; bundle_id: string; display_name: string; required: boolean; notes: string | null };
type DeviceInfo = { id: string; business_id: string; name: string; assigned_user_id: string | null };
type EmployeeInfo = { id: string; full_name: string | null };
type InventoryApp = { id: string; device_id: string; business_id: string; bundle_id: string; app_name: string; version: string | null; is_installed: boolean; last_synced_at: string };
type Review = { id: string; inventory_id: string; business_id: string; status: "new" | "under_review" | "discussed" | "closed"; notes: string | null; updated_at: string };
const statusLabels: Record<Review["status"], string> = { new: "جديد", under_review: "قيد المراجعة", discussed: "تمت المناقشة", closed: "مغلق" };
const statuses: Review["status"][] = ["new", "under_review", "discussed", "closed"];

export function DeviceAppsPage({ canManage }: { canManage: boolean }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [approved, setApproved] = useState<ApprovedApp[]>([]);
  const [inventory, setInventory] = useState<InventoryApp[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [required, setRequired] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true); setError("");
    const [b, a, i, r, d, p] = await Promise.all([
      supabase.from("businesses").select("id,name,code").eq("status", "active").order("name"),
      supabase.from("approved_device_apps").select("id,business_id,bundle_id,display_name,required,notes").order("display_name"),
      supabase.from("device_app_inventory").select("id,device_id,business_id,bundle_id,app_name,version,is_installed,last_synced_at").order("app_name"),
      supabase.from("device_app_reviews").select("id,inventory_id,business_id,status,notes,updated_at").order("updated_at", { ascending: false }),
      supabase.from("devices").select("id,business_id,name,assigned_user_id").order("name"),
      supabase.from("profiles").select("id,full_name").eq("status", "active").order("full_name"),
    ]);
    const failure = [b.error, a.error, i.error, r.error, d.error, p.error].find(Boolean);
    if (failure) setError(failure.message);
    else {
      const businessRows = (b.data ?? []) as Business[];
      setBusinesses(businessRows); setApproved((a.data ?? []) as ApprovedApp[]);
      setInventory((i.data ?? []) as InventoryApp[]); setReviews((r.data ?? []) as Review[]);
      setDevices((d.data ?? []) as DeviceInfo[]); setEmployees((p.data ?? []) as EmployeeInfo[]);
      setBusinessId(current => current || businessRows[0]?.id || "");
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const businessMap = useMemo(() => new Map(businesses.map(b => [b.id, b])), [businesses]);
  const inventoryMap = useMemo(() => new Map(inventory.map(i => [i.id, i])), [inventory]);
  const deviceMap = useMemo(() => new Map(devices.map(d => [d.id, d])), [devices]);
  const employeeMap = useMemo(() => new Map(employees.map(p => [p.id, p])), [employees]);
  const approvedForBusiness = approved.filter(a => !businessId || a.business_id === businessId);
  const reviewsForBusiness = reviews.filter(r => !businessId || r.business_id === businessId);
  const installedCount = inventory.filter(i => i.is_installed && (!businessId || i.business_id === businessId)).length;
  const pendingCount = reviewsForBusiness.filter(r => r.status !== "closed").length;

  async function addApprovedApp(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !canManage || !businessId) return;
    setSaving(true); setError(""); setNotice("");
    const result = await supabase.from("approved_device_apps").insert({
      business_id: businessId, bundle_id: bundleId.trim(), display_name: displayName.trim(),
      required, notes: notes.trim() || null,
    });
    if (result.error) setError(result.error.message);
    else { setBundleId(""); setDisplayName(""); setRequired(false); setNotes(""); setNotice("تمت إضافة التطبيق إلى القائمة المصرّح بها."); await load(); }
    setSaving(false);
  }

  async function removeApprovedApp(app: ApprovedApp) {
    if (!supabase || !canManage || !window.confirm(`إزالة ${app.display_name} من القائمة المصرّح بها؟ قد ينشئ ذلك حالات مراجعة للتطبيق إذا كان مثبتًا.`)) return;
    setError(""); setNotice("");
    const result = await supabase.from("approved_device_apps").delete().eq("id", app.id);
    if (result.error) setError(result.error.message);
    else { setNotice("تم تحديث القائمة؛ راجع الحالات الجديدة الناتجة عن إزالة الاعتماد."); await load(); }
  }

  async function updateReview(review: Review, status: Review["status"], nextNotes: string) {
    if (!supabase || !canManage) return;
    setError(""); setNotice("");
    const result = await supabase.from("device_app_reviews").update({ status, notes: nextNotes.trim() || null }).eq("id", review.id);
    if (result.error) setError(result.error.message);
    else { setNotice("تم حفظ تحديث المراجعة."); await load(); }
  }

  return <section className="data-page">
    <div className="data-page-header"><div><p className="eyebrow">ضمن هواتف الشركة</p><h1>جرد التطبيقات ومراجعتها</h1><p>قائمة التطبيقات المصرّح بها، والجرد الوارد من مزوّد إدارة الأجهزة، ومتابعة الحالات التي تحتاج إلى مراجعة بشرية.</p></div><div className="data-page-actions"><span className="data-count">{installedCount} تطبيقًا مثبتًا</span><span className="data-count">{pendingCount} حالة مفتوحة</span><button className="secondary-button" onClick={() => void load()}>تحديث</button></div></div>
    <div className="filter-bar"><label>الشركة<select value={businessId} onChange={e => setBusinessId(e.target.value)}><option value="">كل الشركات</option>{businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label></div>
    {error && <p className="auth-error">{error.includes("does not exist") || error.includes("schema cache") ? "جداول المرحلة الثانية غير متاحة بعد. راجع الترحيل قبل تشغيل هذه الشاشة." : error}</p>}
    {notice && <p className="success-message">{notice}</p>}
    {canManage && <form className="inline-form" onSubmit={addApprovedApp}>
      <div className="credential-section field-span-2"><strong>إضافة تطبيق مصرّح به</strong><span>استخدم Bundle ID الدقيق للتطبيق، وليس الاسم الظاهر فقط.</span></div>
      <label>اسم التطبيق<input value={displayName} onChange={e => setDisplayName(e.target.value)} required maxLength={160}/></label>
      <label>معرّف الحزمة (Bundle ID)<input value={bundleId} onChange={e => setBundleId(e.target.value)} required maxLength={255} placeholder="com.example.app"/></label>
      <label className="field-span-2">ملاحظات<input value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000}/></label>
      <label className="checkbox-label"><input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)}/> تطبيق مطلوب للعمل</label>
      <div className="form-actions field-span-2"><button className="primary-button" disabled={saving || !businessId}>{saving ? "جارٍ الحفظ…" : "إضافة إلى القائمة"}</button></div>
    </form>}
    <h2>القائمة المصرّح بها</h2>
    {loading ? <div className="loading-state">جارٍ تحميل البيانات…</div> : !approvedForBusiness.length ? <div className="empty-state">لا توجد تطبيقات مصرّح بها لهذه الشركة حتى الآن.</div> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>التطبيق</th><th>Bundle ID</th><th>الشركة</th><th>التصنيف</th><th>إجراء</th></tr></thead><tbody>{approvedForBusiness.map(app => <tr key={app.id}><td><strong>{app.display_name}</strong></td><td dir="ltr">{app.bundle_id}</td><td>{businessMap.get(app.business_id)?.name ?? "—"}</td><td>{app.required ? "مطلوب" : "مصرّح"}</td><td>{canManage && <button className="ghost-button" onClick={() => void removeApprovedApp(app)}>إزالة الاعتماد</button>}</td></tr>)}</tbody></table></div>}
    <h2>جرد التطبيقات المثبتة</h2>
    {!loading && !inventory.some(i => i.is_installed && (!businessId || i.business_id === businessId)) && <div className="empty-state">لم يصل جرد من مزوّد MDM بعد. لن نعرض بيانات تجريبية على أنها بيانات أجهزة حقيقية.</div>}
    {!loading && inventory.some(i => i.is_installed && (!businessId || i.business_id === businessId)) && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>التطبيق</th><th>Bundle ID</th><th>الإصدار</th><th>الهاتف</th><th>الموظف المسؤول</th><th>الشركة</th><th>آخر مزامنة</th></tr></thead><tbody>{inventory.filter(i => i.is_installed && (!businessId || i.business_id === businessId)).map(app => <tr key={app.id}><td>{app.app_name}</td><td dir="ltr">{app.bundle_id}</td><td>{app.version || "—"}</td><td>{deviceMap.get(app.device_id)?.name ?? "جهاز غير متاح"}</td><td>{employeeMap.get(deviceMap.get(app.device_id)?.assigned_user_id ?? "")?.full_name ?? "غير مسند"}</td><td>{businessMap.get(app.business_id)?.name ?? "—"}</td><td>{new Date(app.last_synced_at).toLocaleString("ar")}</td></tr>)}</tbody></table></div>}
    <h2>حالات المراجعة</h2>
    {!loading && !reviewsForBusiness.length && <div className="empty-state">لا توجد حالات مراجعة حاليًا.</div>}
    {!loading && reviewsForBusiness.length > 0 && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>التطبيق</th><th>معرّف الحزمة</th><th>الهاتف</th><th>الموظف المسؤول</th><th>الشركة</th><th>الحالة</th><th>ملاحظات المراجعة</th><th>آخر تحديث</th></tr></thead><tbody>{reviewsForBusiness.map(review => { const app = inventoryMap.get(review.inventory_id); return <tr key={review.id}><td>{app?.app_name ?? "تطبيق غير متاح"}</td><td dir="ltr">{app?.bundle_id ?? "—"}</td><td>{deviceMap.get(app?.device_id ?? "")?.name ?? "جهاز غير متاح"}</td><td>{employeeMap.get(deviceMap.get(app?.device_id ?? "")?.assigned_user_id ?? "")?.full_name ?? "غير مسند"}</td><td>{businessMap.get(review.business_id)?.name ?? "—"}</td><td>{canManage ? <select value={review.status} onChange={e => void updateReview(review, e.target.value as Review["status"], review.notes ?? "")}>{statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select> : statusLabels[review.status]}</td><td>{canManage ? <ReviewNotes review={review} onSave={next => void updateReview(review, review.status, next)}/> : review.notes || "—"}</td><td>{new Date(review.updated_at).toLocaleString("ar")}</td></tr>; })}</tbody></table></div>}
    <p className="muted-note">لا يتضمن هذا الجرد الحساب النشط داخل التطبيق أو محتوى الرسائل أو التطبيق المفتوح حاليًا أو مدة الاستخدام. ظهور تطبيق غير معتمد يطلب مراجعة المسؤول ومناقشة الموظف، ولا يفرض إجراءً تأديبيًا تلقائيًا.</p>
  </section>;
}

function ReviewNotes({ review, onSave }: { review: Review; onSave: (notes: string) => void }) {
  const [value, setValue] = useState(review.notes ?? "");
  useEffect(() => setValue(review.notes ?? ""), [review.notes]);
  return <div className="row-actions"><input value={value} onChange={e => setValue(e.target.value)} placeholder="ملخص النقاش" maxLength={2000}/><button className="ghost-button" onClick={() => onSave(value)}>حفظ</button></div>;
}
