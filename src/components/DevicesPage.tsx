import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Device = {
  id: string; business_id: string; name: string; device_type: string; serial_number: string | null;
  assigned_user_id: string | null; custody_status: "not_assigned" | "in_employee_custody" | "returned";
  handover_date: string | null; return_date: string | null; handover_return_notes: string | null;
  phone_number: string | null; whatsapp_number: string | null;
};
type Business = { id: string; name: string; code: string };
type UserProfile = { id: string; full_name: string | null };
type Credentials = { apple_id: string; apple_password: string; phone_passcode: string; authentication_2fa: string };

const custodyStatuses = ["not_assigned", "in_employee_custody", "returned"] as const;
const emptyCredentials: Credentials = { apple_id: "", apple_password: "", phone_passcode: "", authentication_2fa: "" };

export function DevicesPage({ canManage, userId, role }: { canManage: boolean; userId: string; role: string }) {
  const [devices,setDevices]=useState<Device[]>([]),[businesses,setBusinesses]=useState<Business[]>([]),[users,setUsers]=useState<UserProfile[]>([]);
  const [search,setSearch]=useState(""),[custody,setCustody]=useState(""),[showForm,setShowForm]=useState(false),[editing,setEditing]=useState<string|null>(null);
  const [form,setForm]=useState<Omit<Device,"id">>({business_id:"",name:"",device_type:"iPhone",serial_number:"",assigned_user_id:null,custody_status:"not_assigned",handover_date:null,return_date:null,handover_return_notes:"",phone_number:"",whatsapp_number:""});
  const [credentials,setCredentials]=useState<Credentials>(emptyCredentials),[showCredentials,setShowCredentials]=useState(false),[credentialId,setCredentialId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[saveError,setSaveError]=useState("");

  async function load(){ if(!supabase){setLoading(false);return;} setLoading(true); setError("");
    const [d,b,u]=await Promise.all([
      supabase.from("devices").select("id,business_id,name,device_type,serial_number,assigned_user_id,custody_status,handover_date,return_date,handover_return_notes,phone_number,whatsapp_number").order("name"),
      supabase.from("businesses").select("id,name,code").eq("status","active").order("name"),
      supabase.from("profiles").select("id,full_name").eq("status","active").order("full_name")
    ]);
    const e=[d.error,b.error,u.error].find(Boolean); if(e)setError(e.message); else {setDevices((d.data??[]) as Device[]);setBusinesses((b.data??[]) as Business[]);setUsers((u.data??[]) as UserProfile[]);}
    setLoading(false);
  }
  useEffect(()=>{void load()},[]);

  const businessMap=useMemo(()=>new Map(businesses.map(b=>[b.id,b])),[businesses]);
  const userMap=useMemo(()=>new Map(users.map(u=>[u.id,u])),[users]);
  const filtered=devices.filter(d=>{const q=search.trim().toLowerCase();return (!q||[d.name,d.serial_number,d.phone_number,d.whatsapp_number,userMap.get(d.assigned_user_id??"")?.full_name].some(v=>v?.toLowerCase().includes(q)))&&(custody==="all"||d.custody_status===custody)});

  function reset(){setForm({business_id:businesses[0]?.id??"",name:"",device_type:"iPhone",serial_number:"",assigned_user_id:null,custody_status:"not_assigned",handover_date:null,return_date:null,handover_return_notes:"",phone_number:"",whatsapp_number:""});setCredentials(emptyCredentials);setEditing(null);setSaveError("")}
  function startEdit(d:Device){setEditing(d.id);setShowForm(true);setForm({...d});setCredentials(emptyCredentials);setSaveError("")}

  async function save(e:FormEvent){e.preventDefault();if(!supabase||!canManage)return;setSaving(true);setSaveError("");
    const businessText=form.business_id.trim();
    const employeeText=(form.assigned_user_id??"").trim();
    const business=businesses.find(b=>b.name.toLowerCase()===businessText.toLowerCase()||b.code.toLowerCase()===businessText.toLowerCase());
    const employee=users.find(u=>(u.full_name??"").trim().toLowerCase()===employeeText.toLowerCase()||u.id===employeeText);
    const custodyText=form.custody_status.trim().toLowerCase().replaceAll(" ","_");
    if(!business){setSaveError("Business must match an existing business name or code.");setSaving(false);return;}
    if(employeeText&&!employee){setSaveError("Responsible employee must match an existing employee name.");setSaving(false);return;}
    if(!custodyStatuses.includes(custodyText as Device["custody_status"])){setSaveError("Custody status must be: not assigned, in employee custody, or returned.");setSaving(false);return;}
    const payload={...form,business_id:business.id,assigned_user_id:employee?.id??null,custody_status:custodyText as Device["custody_status"],device_type:"iPhone",serial_number:form.serial_number?.trim()||null,phone_number:form.phone_number?.trim()||null,whatsapp_number:form.whatsapp_number?.trim()||null,handover_return_notes:form.handover_return_notes?.trim()||null};
    const result=editing?await supabase.from("devices").update(payload).eq("id",editing).select("id").single():await supabase.from("devices").insert(payload).select("id").single();
    if(result.error||!result.data){setSaveError(result.error?.message??"Unable to save.");setSaving(false);return;}
    const id=result.data.id;
    const cred=await supabase.functions.invoke("bcs-credentials",{body:{entity:"device",action:"write",entity_id:id,credentials}});
    if(cred.error){setSaveError("Device saved, but credential storage failed. No credential value was exposed.");setSaving(false);await load();return;}
    setShowForm(false);reset();await load();setSaving(false);
  }

  async function reveal(d:Device){if(!(role==="admin"||d.assigned_user_id===userId))return;setCredentialId(d.id);setCredentials(emptyCredentials);setShowCredentials(true);setSaveError("");
    const {data,error}=await supabase!.functions.invoke("bcs-credentials",{body:{entity:"device",action:"read",entity_id:d.id}});
    if(error){setSaveError("Credential reveal was denied or unavailable.");return;}
    setCredentials(data?.credentials??emptyCredentials);
  }
  async function copy(value:string){if(value)await navigator.clipboard.writeText(value)}

  return <section className="data-page">
    <div className="data-page-header"><div><p className="eyebrow">BCS · PHASE 1</p><h1>Company iPhones</h1><p>Company iPhone custody, contact, Apple ID, and protected credential records.</p></div><div className="data-page-actions"><span className="data-count">{filtered.length} of {devices.length} iPhones</span>{canManage&&<button className="primary-button" onClick={()=>{reset();setShowForm(v=>!v)}}>{showForm?"Close":"Add iPhone"}</button>}</div></div>
    {canManage&&showForm&&<form className="inline-form" onSubmit={save}>
      <label>Business<input value={form.business_id} onChange={e=>setForm({...form,business_id:e.target.value})} placeholder="Business name or code" required/></label>
      <label>Phone name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
      <label>Responsible employee<input value={form.assigned_user_id??""} onChange={e=>setForm({...form,assigned_user_id:e.target.value})} placeholder="Employee name"/></label>
      <label>Call phone number<input value={form.phone_number??""} onChange={e=>setForm({...form,phone_number:e.target.value})}/></label>
      <label>WhatsApp number<input value={form.whatsapp_number??""} onChange={e=>setForm({...form,whatsapp_number:e.target.value})}/></label>
      <label>Serial Number<input value={form.serial_number??""} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
      <label>Custody status<input value={form.custody_status.replaceAll("_"," ")} onChange={e=>setForm({...form,custody_status:e.target.value as Device["custody_status"]})} placeholder="Not assigned / In employee custody / Returned"/></label>
      <label>Handover date<input type="date" value={form.handover_date??""} onChange={e=>setForm({...form,handover_date:e.target.value||null})}/></label>
      <label>Return date<input type="date" value={form.return_date??""} onChange={e=>setForm({...form,return_date:e.target.value||null})}/></label>
      <label className="field-span-2">Handover / return notes<textarea value={form.handover_return_notes??""} onChange={e=>setForm({...form,handover_return_notes:e.target.value})}/></label>
      <div className="credential-section field-span-2"><strong>Protected credentials</strong><span>Stored inside BCS Vault and never returned in normal device queries.</span></div>
      <label>iCloud / Apple ID<input value={credentials.apple_id} onChange={e=>setCredentials({...credentials,apple_id:e.target.value})}/></label>
      <label>iCloud password<input type="password" value={credentials.apple_password} onChange={e=>setCredentials({...credentials,apple_password:e.target.value})} autoComplete="new-password"/></label>
      <label>Phone passcode<input type="password" value={credentials.phone_passcode} onChange={e=>setCredentials({...credentials,phone_passcode:e.target.value})} autoComplete="new-password"/></label>
      <label>Authentication / 2FA<input value={credentials.authentication_2fa} onChange={e=>setCredentials({...credentials,authentication_2fa:e.target.value})}/></label>
      {saveError&&<p className="auth-error field-span-2">{saveError}</p>}
      <div className="form-actions field-span-2"><button className="primary-button" disabled={saving}>{saving?"Saving…":editing?"Save changes":"Create iPhone"}</button><button type="button" className="secondary-button" onClick={()=>{setShowForm(false);reset()}}>Cancel</button></div>
    </form>}
    <div className="filter-bar"><input placeholder="Search iPhones…" value={search} onChange={e=>setSearch(e.target.value)}/><input placeholder="Filter custody status…" value={custody.replaceAll("_"," ")} onChange={e=>setCustody(e.target.value.toLowerCase().replaceAll(" ","_"))}/></div>
    {loading&&<div className="loading-state">Loading company iPhones…</div>}{!loading&&error&&<p className="auth-error">{error}</p>}{!loading&&!error&&!filtered.length&&<div className="empty-state">No company iPhones match the current filters.</div>}
    {!loading&&!error&&!!filtered.length&&<div className="data-table-wrap"><table className="data-table"><thead><tr><th>Phone</th><th>Employee</th><th>Call</th><th>WhatsApp</th><th>Serial</th><th>Custody</th><th>Protected</th><th>Actions</th></tr></thead><tbody>{filtered.map(d=><tr key={d.id}><td><strong>{d.name}</strong></td><td>{d.assigned_user_id?userMap.get(d.assigned_user_id)?.full_name||"Assigned":"Not assigned"}</td><td>{d.phone_number||"—"}</td><td>{d.whatsapp_number||"—"}</td><td>{d.serial_number||"—"}</td><td><span className="status-badge">{d.custody_status.replaceAll("_"," ")}</span></td><td>••••••••</td><td><div className="row-actions">{(role==="admin"||d.assigned_user_id===userId)&&<button className="ghost-button" onClick={()=>reveal(d)}>Reveal / copy</button>}{canManage&&<button className="ghost-button" onClick={()=>startEdit(d)}>Edit</button>}</div></td></tr>)}</tbody></table></div>}
    {showCredentials&&credentialId&&<div className="secret-modal"><div className="secret-card"><div className="data-page-header"><div><p className="eyebrow">AUTHORIZED VIEW</p><h2>Protected credentials</h2><p>These values are revealed only after authorization and are never included in list responses.</p></div><button className="secondary-button" onClick={()=>setShowCredentials(false)}>Close</button></div>{saveError&&<p className="auth-error">{saveError}</p>}{Object.entries(credentials).map(([key,value])=><div className="secret-row" key={key}><span>{key.replaceAll("_"," ")}</span><input readOnly type={key.includes("password")||key.includes("passcode")?"password":"text"} value={value}/><button className="ghost-button" onClick={()=>copy(value)}>Copy</button></div>)}</div></div>}
  </section>;
}
