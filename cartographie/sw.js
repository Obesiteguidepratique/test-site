/* Service worker Carte Obesite
   Regle projet : nom de cache synchronise avec le numero de Build.
   A chaque mise a jour : incrementer BUILD ici ET le "Build X" du pied de page. */
const BUILD = 67;
const CACHE = "carte-obesite-v" + BUILD;
const ASSETS = ["./", "./Carte_Obesite.html", "./Carte_Obesite.geojson", "./News.json",
  "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){ return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); })
  );
});
/* Reseau d abord : derniere version en ligne, cache en secours hors-ligne. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.ok){ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); return res; }
      /* reponse non valide (ex. 404 pendant un deploiement) : servir le cache si dispo */
      return caches.match(e.request).then(function(c){ return c || res; });
    })
    .catch(function(){ return caches.match(e.request); })
  );
});
