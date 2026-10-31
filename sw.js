// Offline cache: network-first for the page (always fresh when online), cache-first for everything else.
var V = '20261031215641', CORE = ['./', 'index.html', 'manifest.webmanifest', 'img/fuji.jpg', 'img/ueno.jpg', 'img/chureito.jpg', 'img/tsukiji.jpg', 'img/inari.jpg', 'img/nara.jpg', 'img/katsuoji.jpg', 'img/shirakawago.jpg', 'img/takayama.jpg', 'img/shinhotaka.jpg', 'img/dotonbori.jpg', 'img/kuromon.jpg', 'img/shinsekai.jpg', 'img/icon-192.png'];
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE).catch(function () {}); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/tiles\.openfreemap|elevation-tiles|open-meteo/.test(u.host + u.pathname)) return;   // map tiles + live weather: online only
  if (r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html')) {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return res; })
      .catch(function () { return caches.match(r).then(function (m) { return m || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (m) {
    return m || fetch(r).then(function (res) { if (res.ok || res.type === 'opaque') { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; });
  }));
});
