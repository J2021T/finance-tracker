const { response } = require("express");

const DATA_CACHE_NAME = 'data-cache-v1';
const CACHE_NAME = 'static-cache-v1';
const FILES_TO_CACHE = [
    "/index.html",
    "/js/index.js",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/css/style.css"
];

// install the cache
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// activate the cache
self.addEventListener('activate', function(e) {
    e.waitUntil(
        cache.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('deleting old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// fetch the cache 
self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api')) {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                    .then (response => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(e.request);
                    });
                })
                .catch(err => console.log(err))
        );
        return;
    } else {
        e.respondWith(
            fetch(e.request).catch(function() {
                return caches.match(e.request).then(function(response) {
                    if (response) {
                        return response;
                    } else if (e.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/');
                    }
                });                
            })
        );
    }
});