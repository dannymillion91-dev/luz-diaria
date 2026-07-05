// Service Worker — guarda la app en el dispositivo para que funcione sin internet.
const CACHE = 'luz-dorada-v3';
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

  const esPagina = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (esPagina) {
    // La PÁGINA va primero por INTERNET (así siempre recibes la última versión).
    // Si no hay señal, se usa la copia guardada.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('index.html') || caches.match('habitos.html')))
    );
    return;
  }

  // El resto (imágenes, React, etc.) va primero por la copia guardada (rápido y sin internet).
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
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
