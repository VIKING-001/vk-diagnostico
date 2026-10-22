import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const adminApiSecret = process.env.ADMIN_API_SECRET ?? "";

export async function adminAction(action: string, fields: Record<string, unknown> = {}) {
  if (!adminApiSecret) throw new Error("Admin API is not configured");

  const { data, error } = await supabase.rpc("vk_admin_action", {
    p_api_secret: adminApiSecret,
    p_action: action,
    p_password: fields.password ?? null,
    p_new_password: fields.newPassword ?? null,
    p_code: fields.code ?? null,
    p_expires: fields.expires ?? null,
    p_current_password: fields.currentPassword ?? null,
    p_session_version: fields.sessionVersion ?? null,
    p_ip: fields.ip ?? null,
    p_push_endpoint: fields.endpoint ?? null,
    p_push_p256dh: fields.p256dh ?? null,
    p_push_auth: fields.auth ?? null,
  });

  if (error) throw error;
  return data as Record<string, any>;
}

export function clientIp(headers: Record<string, string | string[] | undefined>) {
  const forwarded = headers["x-forwarded-for"] ?? headers["x-vercel-forwarded-for"];
  return Array.isArray(forwarded) ? forwarded[0]?.split(",")[0]?.trim() : forwarded?.split(",")[0]?.trim();
}
