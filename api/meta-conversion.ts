import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const PIXEL_ID = "362058795954372";

function hash(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing META_ACCESS_TOKEN" });
  }

  const { eventName, eventId, email, phone, eventSourceUrl } = req.body ?? {};

  try {
    const userData: Record<string, unknown> = {
      client_ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      client_user_agent: req.headers["user-agent"],
    };
    if (email) userData.em = [hash(email)];
    if (phone) userData.ph = [hash(phone.replace(/\D/g, ""))];

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName || "Lead",
              event_id: eventId,
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: eventSourceUrl,
              user_data: userData,
            },
          ],
        }),
      }
    );

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to send conversion event" });
  }
}
