import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomInt } from "node:crypto";
import { adminAction, clientIp } from "../server/admin";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FALLBACK_EMAIL = "rodrigocabral366@gmail.com";

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const sameOrigin = origin === `https://${req.headers.host}` || origin === `http://${req.headers.host}`;
  if (origin && !sameOrigin && origin !== "https://vk-diagnostico.vercel.app" && origin !== "http://localhost:5173" && origin !== "http://localhost:8080") return false;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!setCors(req, res)) return res.status(403).end();
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  const { action, code, newPassword } = req.body ?? {};
  try {
    if (action === "send") {
      if (!RESEND_KEY) return res.status(503).json({ error: "Redefinição temporariamente indisponível." });

      const resetCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const result = await adminAction("request_reset", { code: resetCode, expires, ip: clientIp(req.headers) });
      if (!result.ok) return res.status(result.rate_limited ? 429 : 500).json({ error: "Não foi possível enviar o código. Tente novamente." });

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: "VK Diagnóstico <onboarding@resend.dev>",
          to: [result.admin_email || FALLBACK_EMAIL],
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
        console.error("Falha no envio do e-mail de redefinição:", r.status);
        return res.status(502).json({ error: "Não foi possível enviar o código. Tente novamente." });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === "reset") {
      if (typeof code !== "string" || typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 256)
        return res.status(400).json({ error: "Dados inválidos." });
      const result = await adminAction("reset_password", { code, newPassword, ip: clientIp(req.headers) });
      if (!result.ok) return res.status(result.rate_limited ? 429 : 400).json({ error: result.rate_limited ? "Muitas tentativas. Solicite um novo código mais tarde." : "Código inválido ou expirado." });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Ação inválida." });
  } catch (error: any) {
    console.error("Falha na redefinição de senha:", error?.message ?? "erro desconhecido");
    return res.status(500).json({ error: "Não foi possível concluir a operação." });
  }
}
