import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "node:crypto";
import { adminAction, adminApiSecret, clientIp } from "../server/admin";

const ALLOWED_ORIGINS = new Set([
  "https://vk-diagnostico.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const sameOrigin = origin === `https://${req.headers.host}` || origin === `http://${req.headers.host}`;
  if (origin && !ALLOWED_ORIGINS.has(origin) && !sameOrigin) return false;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
  return true;
}

function issueSession(version: string) {
  const payload = Buffer.from(JSON.stringify({ version, exp: Date.now() + 4 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", adminApiSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSession(req: VercelRequest) {
  const token = req.cookies?.vk_admin_session ?? "";
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !adminApiSecret) return null;

  const expected = createHmac("sha256", adminApiSecret).update(payload).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "base64url"); } catch { return null; }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof session.version === "string" && session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!setCors(req, res)) return res.status(403).end();
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body && typeof req.body === "object" ? req.body : {};
  try {
    if (body.action === "login") {
      const result = await adminAction("login", { password: body.password, ip: clientIp(req.headers) });
      if (!result.ok) return res.status(result.rate_limited ? 429 : 401).json({ error: result.rate_limited ? "Muitas tentativas. Aguarde 15 minutos." : "Senha incorreta." });
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      res.setHeader("Set-Cookie", `vk_admin_session=${issueSession(result.version)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=14400${secure}`);
      return res.status(200).json({ ok: true });
    }

    if (body.action === "logout") {
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      res.setHeader("Set-Cookie", `vk_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
      return res.status(200).json({ ok: true });
    }

    const session = readSession(req);
    if (!session) return res.status(401).json({ error: "Sua sessão expirou. Entre novamente." });

    if (body.action === "leads") {
      const result = await adminAction("leads", { sessionVersion: session.version });
      return res.status(200).json({ leads: result.leads ?? [] });
    }

    if (body.action === "change_password") {
      const result = await adminAction("change_password", {
        sessionVersion: session.version,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      if (!result.ok) return res.status(400).json({ error: result.invalid_password ? "A nova senha precisa ter entre 6 e 256 caracteres." : "Senha atual incorreta." });
      return res.status(200).json({ ok: true });
    }

    if (body.action === "register_push") {
      const result = await adminAction("register_push", {
        sessionVersion: session.version,
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth: body.auth,
      });
      if (!result.ok) return res.status(400).json({ error: "Assinatura de notificações inválida." });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Ação inválida." });
  } catch (error: any) {
    if (error?.code === "42501") return res.status(401).json({ error: "Sua sessão expirou. Entre novamente." });
    console.error("Falha na API administrativa:", error?.message ?? "erro desconhecido");
    return res.status(500).json({ error: "Não foi possível concluir a operação." });
  }
}
