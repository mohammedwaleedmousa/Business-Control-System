import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Device = {
  id: string; business_id: string; name: string; device_type: string; serial_number: string | null;
  assigned_user_id: string | null; custody_status: "not_assigned" | "in_employee_custody" | "returned";
  handover_date: string | null; return_date: string | null; handover_return_notes: string | null;
  phone_number: string | null; whatsapp_number: string | null;
};
type الشركة = { id: string; name: string; code: string };
type UserProfile = { id: string; full_name: string | null };
type Credentials = { apple_id: string; apple_password: string; phone_passcode: string; authentication_2fa: string };

const custodyStatuses = ["not_assigned", "in_employee_custody", "returned"] as const;
const custodyLabels: Record<string,string> = { not_assigned:"غير مسندة", in_employee_custody:"لدى الموظف", returned:"مُعادة" };
const credentialLabels: Record<string,string> = { apple_id:"حساب أبل السحابي", apple_password:"كلمة مرور الحساب السحابي", phone_passcode:"رمز دخول الهاتف", authentication_2fa:"المصادقة / التحقق بخطوتين" };
const emptyCredentials: Credentials = { apple_id: "", apple_password: "", phone_passcode: "", authentication_2fa: "" };

export function DevicesPage({ canManage, userId, role }: { canManage: boolean; userId: string; role: string }) {
  const [devices,setDevices]=useState<Device[]>([]),[businesses,setالشركةes]=useState<الشركة[]>([]),[users,setUsers]=useState<UserProfile[]>([]);
  const [search,setSearch]=useState(""),[custody,setالعهدة]=useState(""),[showForm,setShowForm]=useState(false),[editing,setتعديلing]=useState<string|null>(null);
  const [form,setForm]=useState<Omit<Device,"id">>({business_id:"",name:"",device_type:"الهاتف",serial_number:"",assigned_user_id:null,custody_status:"not_assigned",handover_date:null,return_date:null,handover_return_notes:"",phone_number:"",whatsapp_number:""});
  const [credentials,setCredentials]=useState<Credentials>(emptyCredentials),[showCredentials,setShowCredentials]=useState(false),[credentialId,setCredentialId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[saveError,setSaveError]=useState("");

  async function load(){ if(!supabase){setLoading(false);return;} setLoading(true); setError("");
    const [d,b,u]=await Promise.all([
      supabase.from("devices").select("id,business_id,name,device_type,serial_number,assigned_user_id,custody_status,handover_date,return_date,handover_return_notes,phone_number,whatsapp_number").order("name"),
      supabase.from("businesses").select("id,name,code").eq("status","active").order("name"),
      supabase.from("profiles").select("id,full_name").eq("status","active").order("full_name")
    ]);
    const e=[d.error,b.error,u.error].find(Boolean); if(e)setError(e.message); else {setDevices((d.data??[]) as Device[]);setالشركةes((b.data??[]) as الشركة[]);setUsers((u.data??[]) as UserProfile[]);}
    setLoading(false);
  }
  useEffect(()=>{void load()},[]);

  const businessMap=useMemo(()=>new Map(businesses.map(b=>[b.id,b])),[businesses]);
  const userMap=useMemo(()=>new Map(users.map(u=>[u.id,u])),[users]);
  const filtered=devices.filter(d=>{const q=search.trim().toLowerCase();return (!q||[d.name,d.serial_number,d.phone_number,d.whatsapp_number,userMap.get(d.assigned_user_id??"")?.full_name].some(v=>v?.toLowerCase().includes(q)))&&(custody==="all"||d.custody_status===custody)});

  function reset(){setForm({business_id:businesses[0]?.name??"",name:"",device_type:"الهاتف",serial_number:"",assigned_user_id:"",custody_status:"not_assigned",handover_date:null,return_date:null,handover_return_notes:"",phone_number:"",whatsapp_number:""});setCredentials(emptyCredentials);setتعديلing(null);setSaveError("")}
  function startتعديل(d:Device){setتعديلing(d.id);setShowForm(true);setForm({...d,business_id:businessMap.get(d.business_id)?.name??d.business_id,assigned_user_id:d.assigned_user_id?userMap.get(d.assigned_user_id)?.full_name??d.assigned_user_id:""});setCredentials(emptyCredentials);setSaveError("")}

  async function save(e:FormEvent){e.preventDefault();if(!supabase||!canManage)return;setSaving(true);setSaveError("");
    const businessText=form.business_id.trim();
    const employeeText=(form.assigned_user_id??"").trim();
    const business=businesses.find(b=>b.name.toLowerCase()===businessText.toLowerCase()||b.code.toLowerCase()===businessText.toLowerCase());
    const employee=users.find(u=>(u.full_name??"").trim().toLowerCase()===employeeText.toLowerCase()||u.id===employeeText);
    const custodyInput=form.custody_status.trim().toLowerCase().replaceAll(" ","_");
    const custodyText = custodyInput==="غير_مسندة"||custodyInput==="غيرمسندة" ? "not_assigned" : custodyInput==="لدى_الموظف" ? "in_employee_custody" : custodyInput==="مُعادة"||custodyInput==="معادة" ? "returned" : custodyInput;
    if(!business){setSaveError("يجب أن يطابق اسم الشركة أو رمزها شركة موجودة.");setSaving(false);return;}
    if(employeeText&&!employee){setSaveError("يجب أن يطابق الموظف المسؤول اسم موظف موجود.");setSaving(false);return;}
    if(!custodyStatuses.includes(custodyText as Device["custody_status"])){setSaveError("حالة العهدة يجب أن تكون: غير مسندة، لدى الموظف، أو مُعادة.");setSaving(false);return;}
    const payload={...form,business_id:business.id,assigned_user_id:employee?.id??null,custody_status:custodyText as Device["custody_status"],device_type:"الهاتف",serial_number:form.serial_number?.trim()||null,phone_number:form.phone_number?.trim()||null,whatsapp_number:form.whatsapp_number?.trim()||null,handover_return_notes:form.handover_return_notes?.trim()||null};
    const result=editing?await supabase.from("devices").update(payload).eq("id",editing).select("id").single():await supabase.from("devices").insert(payload).select("id").single();
    if(result.error||!result.data){setSaveError(result.error?.message??"تعذر حفظ البيانات.");setSaving(false);return;}
    const id=result.data.id;
    const cred=await supabase.functions.invoke("bcs-credentials",{body:{entity:"device",action:"write",entity_id:id,credentials}});
    if(cred.error){setSaveError("تم حفظ الجهاز، لكن تعذر حفظ بيانات الدخول. لم يتم كشف أي قيمة سرية.");setSaving(false);await load();return;}
    setShowForm(false);reset();await load();setSaving(false);
  }

  async function reveal(d:Device){if(!(role==="admin"||d.assigned_user_id===userId))return;setCredentialId(d.id);setCredentials(emptyCredentials);setShowCredentials(true);setSaveError("");
    const {data,error}=await supabase!.functions.invoke("bcs-credentials",{body:{entity:"device",action:"read",entity_id:d.id}});
    if(error){setSaveError("تم رفض عرض بيانات الدخول أو أنها غير متاحة.");return;}
    setCredentials(data?.credentials??emptyCredentials);
  }
  async function copy(value:string){if(value)await navigator.clipboard.writeText(value)}

  return <section className="data-page">
    <div className="data-page-header"><div><p className="eyebrow">المرحلة الأولى</p><h1>هواتف الشركة</h1><p>إدارة هواتف الشركة، وبيانات الاتصال، وحساب Apple، وبيانات الدخول المحمية.</p></div><div className="data-page-actions"><span className="data-count">{filtered.length} من {devices.length} هاتفًا</span>{canManage&&<button className="primary-button" onClick={()=>{reset();setShowForm(v=>!v)}}>{showForm?"إغلاق":"إضافة هاتف"}</button>}</div></div>
    {canManage&&showForm&&<form className="inline-form" onSubmit={save}>
      <label>الشركة<input value={form.business_id} onChange={e=>setForm({...form,business_id:e.target.value})} placeholder="اسم الشركة أو رمزها" required/></label>
      <label>اسم الهاتف<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
      <label>الموظف المسؤول<input value={form.assigned_user_id??""} onChange={e=>setForm({...form,assigned_user_id:e.target.value})} placeholder="اسم الموظف"/></label>
      <label>رقم الاتصال<input value={form.phone_number??""} onChange={e=>setForm({...form,phone_number:e.target.value})}/></label>
      <label>رقم واتساب<input value={form.whatsapp_number??""} onChange={e=>setForm({...form,whatsapp_number:e.target.value})}/></label>
      <label>الرقم التسلسلي<input value={form.serial_number??""} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
      <label>حالة العهدة<input value={form.custody_status.replaceAll("_"," ")} onChange={e=>setForm({...form,custody_status:e.target.value as Device["custody_status"]})} placeholder="غير مسندة / لدى الموظف / مُعادة"/></label>
      <label>تاريخ التسليم<input type="date" value={form.handover_date??""} onChange={e=>setForm({...form,handover_date:e.target.value||null})}/></label>
      <label>تاريخ الإعادة<input type="date" value={form.return_date??""} onChange={e=>setForm({...form,return_date:e.target.value||null})}/></label>
      <label className="field-span-2">ملاحظات التسليم / الإعادة<textarea value={form.handover_return_notes??""} onChange={e=>setForm({...form,handover_return_notes:e.target.value})}/></label>
      <div className="credential-section field-span-2"><strong>بيانات الدخول المحمية</strong><span>تُحفظ داخل الخزنة الآمنة ولا تُعاد ضمن استعلامات الأجهزة العادية.</span></div>
      <label>حساب أبل السحابي<input value={credentials.apple_id} onChange={e=>setCredentials({...credentials,apple_id:e.target.value})}/></label>
      <label>كلمة مرور الحساب السحابي<input type="password" value={credentials.apple_password} onChange={e=>setCredentials({...credentials,apple_password:e.target.value})} autoComplete="new-password"/></label>
      <label>رمز دخول الهاتف<input type="password" value={credentials.phone_passcode} onChange={e=>setCredentials({...credentials,phone_passcode:e.target.value})} autoComplete="new-password"/></label>
      <label>المصادقة / التحقق بخطوتين<input value={credentials.authentication_2fa} onChange={e=>setCredentials({...credentials,authentication_2fa:e.target.value})}/></label>
      {saveError&&<p className="auth-error field-span-2">{saveError}</p>}
      <div className="form-actions field-span-2"><button className="primary-button" disabled={saving}>{saving?"جارٍ الحفظ…":editing?"حفظ التغييرات":"إنشاء هاتف"}</button><button type="button" className="secondary-button" onClick={()=>{setShowForm(false);reset()}}>إلغاء</button></div>
    </form>}
    <div className="filter-bar"><input placeholder="البحث في الهواتف…" value={search} onChange={e=>setSearch(e.target.value)}/><input placeholder="تصفية حسب حالة العهدة…" value={custody.replaceAll("_"," ")} onChange={e=>setالعهدة(e.target.value.toLowerCase().replaceAll(" ","_"))}/></div>
    {loading&&<div className="loading-state">جارٍ تحميل هواتف الشركة…</div>}{!loading&&error&&<p className="auth-error">{error}</p>}{!loading&&!error&&!filtered.length&&<div className="empty-state">لا توجد هواتف تطابق عوامل التصفية الحالية.</div>}
    {!loading&&!error&&!!filtered.length&&<div className="data-table-wrap"><table className="data-table"><thead><tr><th>الهاتف</th><th>الموظف</th><th>الاتصال</th><th>واتساب</th><th>التسلسلي</th><th>العهدة</th><th>محمي</th><th>الإجراءات</th></tr></thead><tbody>{filtered.map(d=><tr key={d.id}><td><strong>{d.name}</strong></td><td>{d.assigned_user_id?userMap.get(d.assigned_user_id)?.full_name||"مسند":"غير مسند"}</td><td>{d.phone_number||"—"}</td><td>{d.whatsapp_number||"—"}</td><td>{d.serial_number||"—"}</td><td><span className="status-badge">{custodyLabels[d.custody_status]||d.custody_status}</span></td><td>••••••••</td><td><div className="row-actions">{(role==="admin"||d.assigned_user_id===userId)&&<button className="ghost-button" onClick={()=>reveal(d)}>عرض / نسخ</button>}{canManage&&<button className="ghost-button" onClick={()=>startتعديل(d)}>تعديل</button>}</div></td></tr>)}</tbody></table></div>}
    {showCredentials&&credentialId&&<div className="secret-modal"><div className="secret-card"><div className="data-page-header"><div><p className="eyebrow">عرض مصرح</p><h2>بيانات الدخول المحمية</h2><p>تظهر هذه القيم بعد التحقق من الصلاحية فقط، ولا تُعرض ضمن قوائم الأجهزة.</p></div><button className="secondary-button" onClick={()=>setShowCredentials(false)}>إغلاق</button></div>{saveError&&<p className="auth-error">{saveError}</p>}{Object.entries(credentials).map(([key,value])=><div className="secret-row" key={key}><span>{credentialLabels[key]||key}</span><input readOnly type={key.includes("password")||key.includes("passcode")?"password":"text"} value={value}/><button className="ghost-button" onClick={()=>copy(value)}>نسخ</button></div>)}</div></div>}
  </section>;
}
