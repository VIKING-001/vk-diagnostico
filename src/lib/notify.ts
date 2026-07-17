import type { LeadData } from "./supabase";

export async function notifyLead(data: LeadData) {
  try {
    const r = await fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) console.error("Erro ao notificar:", await r.text());
  } catch (e) {
    console.error("Erro ao notificar:", e);
  }
}
