// Service worker tối giản: chỉ giúp PWA đủ điều kiện cài đặt,
// không cache dữ liệu (luôn đi qua mạng để dữ liệu luôn mới).
self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
});
