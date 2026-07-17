import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const RESEND_KEY = process.env.RESEND_API_KEY!;
const FALLBACK_EMAIL = "rodrigocabral366@gmail.com";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface LeadPayload {
  nome?: string;
  empresa?: string;
  whatsapp?: string;
  email?: string;
  negocio?: string;
  segmento?: string;
  desafio?: string;
  orcamento?: string;
  quando_comecar?: string;
  qualificado?: boolean;
  [key: string]: unknown;
}

async function sendEmail(lead: LeadPayload) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || FALLBACK_EMAIL;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
      <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0 0 24px">VK Diagnóstico — Novo lead</p>
      <h2 style="margin:0 0 8px;font-size:24px">${lead.nome ?? "Lead sem nome"}</h2>
      <p style="margin:0 0 24px;color:#555">${lead.empresa ?? ""}</p>
      ${
        lead.qualificado
          ? `<span style="display:inline-block;background:#fff4d6;color:#9a6b00;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:999px;margin-bottom:20px">QUALIFICADO</span>`
          : `<span style="display:inline-block;background:#f0f0f0;color:#888;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:999px;margin-bottom:20px">NÃO QUALIFICADO</span>`
      }
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
        ${row("WhatsApp", lead.whatsapp)}
        ${row("E-mail", lead.email)}
        ${row("Negócio", lead.negocio)}
        ${row("Segmento", lead.segmento)}
        ${row("Maior desafio", lead.desafio)}
        ${row("Orçamento mensal", lead.orcamento)}
        ${row("Quando quer começar", lead.quando_comecar)}
      </table>
      <p style="color:#999;font-size:13px;margin-top:24px">Abra o painel admin para ver o diagnóstico completo.</p>
    </div>
  `;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: "VK Diagnóstico <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🔔 Novo lead: ${lead.nome ?? "sem nome"} — ${lead.empresa ?? ""}`,
      html,
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Resend error: ${err}`);
  }
}

function row(label: string, value?: string) {
  if (!value) return "";
  return `<tr><td style="padding:6px 0;color:#888;width:180px">${label}</td><td style="padding:6px 0;color:#222;font-weight:500">${value}</td></tr>`;
}

// WhatsApp via bot Baileys separado — configurar WHATSAPP_BOT_URL/WHATSAPP_BOT_API_KEY quando o bot estiver no ar.
async function sendWhatsApp(lead: LeadPayload) {
  const botUrl = process.env.WHATSAPP_BOT_URL;
  const apiKey = process.env.WHATSAPP_BOT_API_KEY;
  if (!botUrl || !apiKey) return "skipped";

  const text = `🔔 Novo lead!\n${lead.nome ?? ""} — ${lead.empresa ?? ""}\n${lead.whatsapp ?? ""}\nSegmento: ${lead.segmento ?? ""}\nOrçamento: ${lead.orcamento ?? ""}`;
  const r = await fetch(`${botUrl}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(await r.text());
  return "sent";
}

// Push via web-push — notifica todos os dispositivos inscritos no painel admin (PWA).
async function sendPush(lead: LeadPayload) {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) return "skipped";

  webpush.setVapidDetails("mailto:raioshops@gmail.com", vapidPublic, vapidPrivate);

  const { data: subs } = await supabase.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) return "no-subscriptions";

  const payload = JSON.stringify({
    title: "🔔 Novo lead!",
    body: `${lead.nome ?? ""} — ${lead.empresa ?? ""}`,
    url: "/admin",
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
        .catch(async (err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", s.id);
          }
        })
    )
  );

  return "sent";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const lead: LeadPayload = req.body ?? {};

  const [emailResult, whatsappResult, pushResult] = await Promise.allSettled([
    sendEmail(lead),
    sendWhatsApp(lead),
    sendPush(lead),
  ]);

  if (emailResult.status === "rejected") {
    console.error("Erro ao enviar e-mail de notificação:", emailResult.reason);
  }
  if (whatsappResult.status === "rejected") {
    console.error("Erro ao enviar WhatsApp de notificação:", whatsappResult.reason);
  }

  res.status(200).json({
    ok: true,
    email: emailResult.status,
    whatsapp: whatsappResult.status,
    push: pushResult.status,
  });
}
