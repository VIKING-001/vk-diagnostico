import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAction } from "../server/admin.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await adminAction("healthcheck");
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Supabase indisponível." });
  }
}
