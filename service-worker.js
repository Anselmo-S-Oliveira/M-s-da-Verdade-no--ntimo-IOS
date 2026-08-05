const CACHE_NAME = "mes-da-verdade-v3-1";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_FILES);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(function () {
        return caches.match(event.request)
          .then(function (cached) {
            return cached || caches.match("./index.html");
          });
      })
  );
});
