/* Kikz Training offline-first service worker. */
const CACHE='kikz-training-v45';
const CORE_ASSETS=[
  './','./index.html','./styles.css?v=30','./app.js?v=31','./data.js?v=30',
  './manifest.webmanifest?v=45','./day1.png','./day2.png','./day3.png','./day4.png',
  './kikz-home-clean.jpg?v=43','./icons/icon-192.png?v=45','./icons/icon-512.png?v=45'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE_ASSETS);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('kikz-training-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')event.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;try{const response=await fetch(request);if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}catch(error){if(request.mode==='navigate')return await caches.match('./index.html',{ignoreSearch:true})||await caches.match('./',{ignoreSearch:true});return new Response('',{status:504,statusText:'Offline'});}})());});