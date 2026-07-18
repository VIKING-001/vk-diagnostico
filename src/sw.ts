/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Assume o controle imediatamente ao instalar, em vez de esperar todas as
// abas antigas fecharem — sem isso, deploys novos ficam "presos" atrás de
// uma versão em cache até o usuário fechar completamente o app/navegador.
self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Novo lead!", {
      body: data.body || "",
      icon: "/pwa-192.png",
      badge: "/pwa-192.png",
      data: { url: data.url || "/admin" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const url = (event.notification.data as { url?: string })?.url || "/admin";
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return (existing as WindowClient).focus();
      return self.clients.openWindow(url);
    })
  );
});
