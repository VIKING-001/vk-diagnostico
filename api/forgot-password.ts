import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const RESEND_KEY = process.env.RESEND_API_KEY!;
const FALLBACK_EMAIL = "rodrigocabral366@gmail.com";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { action, code, newPassword } = req.body ?? {};

  // ── Enviar código ─────────────────────────────────────────────────────
  if (action === "send") {
    const { data: emailRow } = await supabase
      .from("config").select("value").eq("key", "admin_email").single();
    const adminEmail = emailRow?.value ?? FALLBACK_EMAIL;

    const resetCode = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("config").update({ value: resetCode }).eq("key", "reset_code");
    await supabase.from("config").update({ value: expires }).eq("key", "reset_code_expires");

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "VK Diagnóstico <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "Código para redefinir sua senha — VK Diagnóstico",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin:0 0 24px">VK Company — Painel Admin</p>
            <h2 style="margin:0 0 16px;font-size:24px">Redefinição de senha</h2>
            <p style="color:#555;margin:0 0 24px">Use o código abaixo para criar uma nova senha. Válido por <strong>15 minutos</strong>.</p>
            <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px">
              <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a1a">${resetCode}</span>
            </div>
            <p style="color:#999;font-size:13px">Se não foi você quem solicitou, ignore este e-mail. Sua senha não será alterada.</p>
          </div>
        `,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: "Erro ao enviar e-mail", detail: err });
    }

    return res.status(200).json({ ok: true, sentTo: adminEmail });
  }

  // ── Verificar código e redefinir senha ────────────────────────────────
  if (action === "reset") {
    if (!code || !newPassword || newPassword.length < 6)
      return res.status(400).json({ error: "Dados inválidos" });

    const [{ data: codeRow }, { data: expiresRow }] = await Promise.all([
      supabase.from("config").select("value").eq("key", "reset_code").single(),
      supabase.from("config").select("value").eq("key", "reset_code_expires").single(),
    ]);

    if (!codeRow?.value || codeRow.value !== code)
      return res.status(400).json({ error: "Código inválido" });

    if (!expiresRow?.value || new Date(expiresRow.value) < new Date())
      return res.status(400).json({ error: "Código expirado. Solicite um novo." });

    await Promise.all([
      supabase.from("config").update({ value: newPassword }).eq("key", "admin_password"),
      supabase.from("config").update({ value: "" }).eq("key", "reset_code"),
      supabase.from("config").update({ value: "" }).eq("key", "reset_code_expires"),
    ]);

    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: "Ação inválida" });
}
