const appName = import.meta.env.VITE_APP_NAME || "Business Control System";
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const config = {
  appName,
  appUrl,
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  },
} as const;
