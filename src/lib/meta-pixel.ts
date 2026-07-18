declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackLeadConversion(email: string, phone: string) {
  const eventId = crypto.randomUUID();

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", {}, { eventID: eventId });
  }

  fetch("/api/meta-conversion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName: "Lead",
      eventId,
      email,
      phone,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
    }),
  }).catch(() => {});
}
