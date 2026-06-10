const CACHE_NAME = "sporlab-e8-e9-v14";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./content.js",
  "./app.js",
  "./assets/qrcode.js",
  "./manifest.webmanifest",
  "./assets/nrh-logo-romerike.png",
  "./assets/nrh-logo-romerike-square.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function cachePutSafe(request, response) {
  try {
    if (!response || !response.ok || response.type === "opaque" || response.type === "opaqueredirect") {
      return;
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (error) {
    // Ignoring failed cache writes is acceptable — the network fetch already succeeded.
  }
}

async function fallbackForNavigation() {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cachePutSafe(request, response);
          return response;
        })
        .catch(() => fallbackForNavigation())
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          cachePutSafe(request, response);
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
