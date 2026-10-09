const CACHE="nassr-hub-alnaser2-v15";
const ASSETS=[
  "/alnaser2/","/alnaser2/index.html","/alnaser2/style.css","/alnaser2/app.js",
  "/alnaser2/manifest.webmanifest?v=15",
  "/alnaser2/icons/nassr-hub-192.png","/alnaser2/icons/nassr-hub-512.png",
  "/alnaser2/icons/nassr-hub-maskable-512.png","/alnaser2/icons/apple-touch-icon.png",
  "/alnaser2/data/current-players.json","/alnaser2/data/legends.json",
  "/alnaser2/data/historical-foreigners.json","/alnaser2/data/trophies.json",
  "/alnaser2/data/source-policy.json","/alnaser2/data/fixtures.json",
  "/alnaser2/data/history.json","/alnaser2/data/seasons.json"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request))
  );
});