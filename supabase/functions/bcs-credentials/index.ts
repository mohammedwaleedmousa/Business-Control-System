import { withSupabase } from "npm:@supabase/server@1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
      const body = await req.json();
      const entity = body.entity;
      const action = body.action;
      const entityId = String(body.entity_id ?? "");

      if (!["device", "account"].includes(entity) || !["read", "write"].includes(action) || !entityId) {
        return json({ error: "Invalid request." }, 400);
      }

      const userId = ctx.userClaims?.sub;
      if (!userId) return json({ error: "Authentication required." }, 401);

      const { data: profile, error: profileError } = await ctx.supabaseAdmin
        .from("profiles")
        .select("id, role, status")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profile || profile.status !== "active") return json({ error: "Unauthorized." }, 403);

      let responsible = false;
      let businessId = "";
      if (entity === "device") {
        const { data, error } = await ctx.supabaseAdmin.from("devices")
          .select("id, business_id, assigned_user_id").eq("id", entityId).maybeSingle();
        if (error || !data) return json({ error: "Device not found." }, 404);
        responsible = data.assigned_user_id === userId;
        businessId = data.business_id;
      } else {
        const { data, error } = await ctx.supabaseAdmin.from("accounts")
          .select("id, business_id, owner_user_id").eq("id", entityId).maybeSingle();
        if (error || !data) return json({ error: "Account not found." }, 404);
        responsible = data.owner_user_id === userId;
        businessId = data.business_id;
      }

      const isAdmin = profile.role === "admin";
      if (action === "write" && !isAdmin) return json({ error: "Administrator authorization required." }, 403);
      if (action === "read" && !isAdmin && !responsible) return json({ error: "Credential access denied." }, 403);

      const table = entity === "device" ? "device_credentials" : "account_credentials";
      const key = entity === "device" ? "device_id" : "account_id";
      const { data: mapping, error: mappingError } = await ctx.supabaseAdmin
        .from(table).select("vault_secret_id").eq(key, entityId).maybeSingle();

      if (mappingError) return json({ error: "Credential store unavailable." }, 500);

      if (action === "read") {
        if (!mapping?.vault_secret_id) return json({ credentials: null });
        const { data: secret, error } = await ctx.supabaseAdmin.rpc("bcs_read_vault_secret", { secret_id: mapping.vault_secret_id });
        if (error) return json({ error: "Credential reveal failed." }, 500);
        try { return json({ credentials: JSON.parse(secret as string) }); }
        catch { return json({ error: "Credential data is invalid." }, 500); }
      }

      const credentials = entity === "device"
        ? {
            apple_id: String(body.credentials?.apple_id ?? ""),
            apple_password: String(body.credentials?.apple_password ?? ""),
            phone_passcode: String(body.credentials?.phone_passcode ?? ""),
            authentication_2fa: String(body.credentials?.authentication_2fa ?? ""),
          }
        : {
            password: String(body.credentials?.password ?? ""),
            authentication_2fa: String(body.credentials?.authentication_2fa ?? ""),
          };

      const secretName = "bcs-" + entity + "-" + entityId;
      const secretDescription = "BCS Phase 1 protected credential record for " + entity + " in business " + businessId;

      if (mapping?.vault_secret_id) {
        const { error } = await ctx.supabaseAdmin.rpc("bcs_update_vault_secret", {
          secret_id: mapping.vault_secret_id,
          secret_value: JSON.stringify(credentials),
          secret_name: secretName,
          secret_description: secretDescription,
        });
        if (error) return json({ error: "Credential update failed." }, 500);
      } else {
        const { data: secretId, error } = await ctx.supabaseAdmin.rpc("bcs_create_vault_secret", {
          secret_value: JSON.stringify(credentials),
          secret_name: secretName,
          secret_description: secretDescription,
        });
        if (error || !secretId) return json({ error: "Credential creation failed." }, 500);

        const { error: insertError } = await ctx.supabaseAdmin
          .from(table).insert({ [key]: entityId, vault_secret_id: secretId });
        if (insertError) return json({ error: "Credential mapping failed." }, 500);
      }

      return json({ ok: true });
    } catch {
      return json({ error: "Invalid request." }, 400);
    }
  }),
};
