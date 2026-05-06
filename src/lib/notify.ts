import emailjs from "@emailjs/browser";
import type { LeadData } from "./supabase";

export async function notifyLead(data: LeadData) {
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

  const whatsappLink = `https://wa.me/55${data.whatsapp.replace(/\D/g, "")}`;

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    ...data,
    whatsapp_link: whatsappLink,
  }, PUBLIC_KEY);
}
