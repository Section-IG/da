var CACHE_NAME = 'IESN_IG_DA';
var urlsToCache = [
    '/',
    '/styles/app.css',
    '/styles/pcp-highlight.css',
    '/styles/print.css',
    '/styles/reset.css',
    '/styles/toastr.min.css',
    '/scripts/app.js',
    '/scripts/PseudoCodeParser.js',
    '/scripts/libraries/jquery-3.2.1.min.js',
    '/scripts/libraries/toastr.min.js',
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
                console.log(event.request)
                return response;
            }

            return fetch(event.request).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic' || !response.url.startsWith('http')) {
                        return response;
                    }

                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );

        })
    );
});