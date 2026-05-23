import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
    res.status(200).json({ ok: true, leads: count, ts: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
