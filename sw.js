const CACHE="alnaser-hub-v14";
const ASSETS=[
  "/alnaser2/","/alnaser2/index.html","/alnaser2/style.css","/alnaser2/app.js",
  "/alnaser2/manifest.webmanifest",
  "/alnaser2/icons/icon-192.png","/alnaser2/icons/icon-512.png",
  "/alnaser2/data/current-players.json","/alnaser2/data/legends.json",
  "/alnaser2/data/historical-foreigners.json","/alnaser2/data/trophies.json",
  "/alnaser2/data/source-policy.json","/alnaser2/data/fixtures.json",
  "/alnaser2/data/history.json","/alnaser2/data/seasons.json"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin){return;}
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});