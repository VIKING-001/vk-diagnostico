import { supabase } from "./supabase";
import type { LeadData } from "./supabase";

export async function notifyLead(data: LeadData) {
  // Chama a Edge Function no Supabase que envia o email via Resend
  const { error } = await supabase.functions.invoke("notify-lead", {
    body: data,
  });
  if (error) console.error("Erro ao notificar:", error);
}
