import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "./DeviceStatusDashboard.css";

type Device={id:string;business_id:string;name:string;assigned_user_id:string|null;custody_status:string};
type Profile={id:string;full_name:string|null};
type ApprovedApp={business_id:string;bundle_id:string;display_name:string};
type Status={device_id:string;connection_state:"online"|"offline"|"unknown";last_seen_at:string|null;current_app_bundle_id:string|null;current_app_name:string|null;current_app_observed_at:string|null;account_scope:"personal"|"company"|"unknown";source:string;updated_at:string};

const custody:{[key:string]:string}={not_assigned:"غير مسندة",in_employee_custody:"لدى الموظف",returned:"مُعادة"};
const connection:{[key:string]:string}={online:"متصل",offline:"غير متصل",unknown:"غير متاح"};
const scope:{[key:string]:string}={personal:"حساب شخصي",company:"حساب شركة",unknown:"الحساب غير محدد"};

function relative(value:string|null){if(!value)return "لا توجد مزامنة";const m=Math.floor(Math.max(0,Date.now()-new Date(value).getTime())/60000);if(m<1)return "منذ أقل من دقيقة";if(m<60)return "منذ "+m+" دقيقة";return "منذ "+Math.floor(m/60)+" ساعة";}

export function DeviceStatusDashboard({userId,role}:{userId:string;role:string}){
 const [devices,setDevices]=useState<Device[]>([]),[profiles,setProfiles]=useState<Profile[]>([]),[apps,setApps]=useState<ApprovedApp[]>([]),[statuses,setStatuses]=useState<Status[]>([]),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){if(!supabase){setLoading(false);return;}const [d,p,a,s]=await Promise.all([
  supabase.from("devices").select("id,business_id,name,assigned_user_id,custody_status").eq("device_type","الهاتف").order("name"),
  supabase.from("profiles").select("id,full_name").eq("status","active"),
  supabase.from("approved_device_apps").select("business_id,bundle_id,display_name").order("display_name"),
  supabase.from("device_status_telemetry").select("device_id,connection_state,last_seen_at,current_app_bundle_id,current_app_name,current_app_observed_at,account_scope,source,updated_at")
 ]);const e=[d.error,p.error,a.error,s.error].find(Boolean);if(e)setError(e.message);else{setDevices((d.data??[]) as Device[]);setProfiles((p.data??[]) as Profile[]);setApps((a.data??[]) as ApprovedApp[]);setStatuses((s.data??[]) as Status[]);}setLoading(false);}
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),15000);return()=>window.clearInterval(id);},[]);
 const users=useMemo(()=>new Map(profiles.map(p=>[p.id,p.full_name||"موظف"])),[profiles]);
 const statusMap=useMemo(()=>new Map(statuses.map(s=>[s.device_id,s])),[statuses]);
 const filtered=devices.filter(d=>{const q=search.trim().toLowerCase();return !q||d.name.toLowerCase().includes(q)||(users.get(d.assigned_user_id||"")||"").toLowerCase().includes(q);});
 function openManagement(){window.history.pushState({},"","/devices/manage");window.dispatchEvent(new PopStateEvent("popstate"));}
 return <section className="data-page">
  <div className="data-page-header"><div><p className="eyebrow">الحالة المباشرة</p><h1>هواتف الشركة</h1><p>كل هاتف في بطاقة مستقلة: العهدة، الاتصال، التطبيق الحالي المبلّغ عنه، والتطبيقات المصرح بها.</p></div><div className="data-page-actions"><span className="data-count">{filtered.length} هاتفًا</span>{role==="admin"&&<button className="primary-button" onClick={openManagement}>إدارة بيانات الهواتف</button>}</div></div>
  <div className="filter-bar"><input placeholder="البحث باسم الهاتف أو الموظف…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
  {loading&&<div className="loading-state">جارٍ تحميل حالة هواتف الشركة…</div>}
  {!loading&&error&&<p className="auth-error">{error}</p>}
  {!loading&&!error&&!filtered.length&&<div className="empty-state">لا توجد هواتف.</div>}
  {!loading&&!error&&!!filtered.length&&<div className="device-status-grid">{filtered.map(d=>{const s=statusMap.get(d.id);const employee=users.get(d.assigned_user_id||"")||"غير مسند";const allowed=apps.filter(a=>a.business_id===d.business_id);const active=allowed.find(a=>a.bundle_id===s?.current_app_bundle_id);const current=s?.current_app_name||"غير متاح من مزود الإدارة";return <article className="device-status-card" key={d.id}>
   <div className="device-status-card-head"><div><p className="eyebrow">هاتف الشركة</p><h2>{d.name}</h2><p>{employee} · {custody[d.custody_status]||d.custody_status}</p></div><span className={"device-connection-badge "+(s?.connection_state||"unknown")}>{connection[s?.connection_state||"unknown"]}</span></div>
   <div className="device-status-main"><div><span className="status-label">يستخدم الآن</span><strong>{current}</strong><small>{s?.current_app_name?scope[s.account_scope]:"لا توجد قراءة موثوقة للتطبيق الحالي بعد"}</small></div><div><span className="status-label">آخر اتصال</span><strong>{relative(s?.last_seen_at||null)}</strong><small>{s?.source?"المصدر: "+s.source:"بانتظار ربط مزود الإدارة"}</small></div></div>
   <div className="device-status-section"><span className="status-label">التطبيقات المصرح بها</span><div className="device-app-chips">{allowed.length?allowed.map(a=><span className={"device-app-chip "+(active?.bundle_id===a.bundle_id?"active":"")} key={a.bundle_id}>{a.display_name}{active?.bundle_id===a.bundle_id?" · مفتوح":""}</span>):<span className="muted-text">لا توجد قائمة مصرح بها</span>}</div></div>
   <div className="device-status-footer"><span>آخر تحديث: {relative(s?.updated_at||null)}</span><span>{s?.current_app_observed_at?"رُصد التطبيق "+relative(s.current_app_observed_at):"بانتظار telemetry"}</span></div>
  </article>})}</div>}
 </section>;
}