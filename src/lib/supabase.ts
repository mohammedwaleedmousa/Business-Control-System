import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env";

export const supabase = config.supabase.isConfigured
  ? createClient(config.supabase.url, config.supabase.anonKey)
  : null;
