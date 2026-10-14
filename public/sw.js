// Offline support: keeps a copy of the app on the phone so it still opens with no signal.
// Squads and battles already work offline through Firestore's own on-device cache;
// this only covers the app's own files (page, scripts, styles, fonts, icons, PDFs).
//
// - The page itself: network first, so updates arrive as soon as there's signal; the saved copy otherwise.
// - Built files (assets/, hashed names never change): saved copy first.
// - Everything else from this site: saved copy straight away, refreshed in the background.
// Other sites (Firebase, Google sign-in) are left alone.

const CACHE = 'sf-app-v1';
const scope = new URL(self.registration.scope);
const INDEX = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll([scope.href, INDEX])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

// The page sends the files it loaded before this worker took over, so the first visit is saved too.
self.addEventListener('message', event => {
  if (event.data?.type !== 'cache') return;
  const urls = event.data.urls.filter(u => u.startsWith(scope.href));
  event.waitUntil(caches.open(CACHE).then(c => Promise.all(urls.map(u => c.match(u).then(hit => hit || c.add(u).catch(() => {}))))));
});

const isAsset = url => url.startsWith(new URL('assets/', scope).href);

// Drop built files the new page no longer uses, so old versions don't pile up.
async function pruneAssets(cache, html) {
  for (const req of await cache.keys()) {
    if (isAsset(req.url) && !html.includes(new URL(req.url).pathname.split('/').pop())) {
      // Fonts and other files are referenced from the CSS, not the page; keep anything the CSS names.
      if (!/\.(js|css)$/.test(req.url)) continue;
      await cache.delete(req);
    }
  }
}

async function page(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) {
      await cache.put(INDEX, res.clone());
      pruneAssets(cache, await res.clone().text());
    }
    return res;
  } catch {
    return (await cache.match(INDEX)) || (await cache.match(scope.href)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const fresh = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });
  if (hit) {
    event.waitUntil(fresh.catch(() => {}));
    return hit;
  }
  return fresh;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(scope.href)) return;
  if (request.mode === 'navigate') return event.respondWith(page(request));
  if (isAsset(request.url)) return event.respondWith(cacheFirst(request));
  event.respondWith(staleWhileRevalidate(request, event));
});
