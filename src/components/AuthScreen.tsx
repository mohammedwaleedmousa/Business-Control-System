import type { FormEvent } from "react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("لم يتم إعداد Supabase. أضف إعدادات Supabase العامة الخاصة بـ Vite.");
      return;
    }
    setPending(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setPending(false);
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">BCS</p>
      <h1>تسجيل الدخول</h1>
      <p className="auth-description">استخدم حساب BCS المصرح لك به للمتابعة.</p>
      <form onSubmit={signIn} className="auth-form">
        <label>
          البريد الإلكتروني
          <input type="email" value={email} onChange={(e) => setالبريد الإلكتروني(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          كلمة المرور
          <input type="password" value={password} onChange={(e) => setكلمة المرور(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
        </button>
      </form>
    </section>
  );
}
