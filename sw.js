var CACHE_NAME = 'IESN_IG_DA';
var urlsToCache = [
    "/da/",
    "/da/styles/app.css",
    "/da/styles/pcp-highlight.css",
    "/da/styles/print.css",
    "/da/styles/reset.css",
    "/da/styles/toastr.min.css",
    "/da/scripts/app.js",
    "/da/scripts/PseudoCodeParser.js",
    "/da/scripts/libraries/jquery-3.2.1.min.js",
    "/da/scripts/libraries/toastr.min.js",
    "https://use.fontawesome.com/ca53c7c19d.css",
    "https://use.fontawesome.com/ca53c7c19d.js",
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker is activated!');
});


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                function (response) {
                    // Check if we received a valid response
                    if (response && response.status === 200 && response.type === 'basic' && response.url.startsWith('http')) {
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    
                    return response;
                }
            );

        })
    );
});