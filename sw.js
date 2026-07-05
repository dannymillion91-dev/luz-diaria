// Service Worker — guarda la app en el dispositivo para que funcione sin internet.
const CACHE = 'luz-dorada-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'assets/vendor/react.production.min.js',
  'assets/vendor/react-dom.production.min.js',
  'assets/vendor/babel.min.js',
  'assets/portada.jpg',
  'assets/interior.jpg',
  'assets/suenos.jpg',
  'assets/mariposa-azul.png',
  'assets/mariposa-rosa.png',
  'assets/mariposa-azul2.png',
  'assets/mariposa-rosa2.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Guarda en caché los recursos propios que se vayan pidiendo
          if (res && res.status === 200 && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
