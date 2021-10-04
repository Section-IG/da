const CACHE_NAME = 'IESN_IG_DA';
const urlsToCache = [
    '/da/',
    '/da/styles/app.css',
    '/da/styles/pcp-highlight.css',
    '/da/styles/print.css',
    '/da/styles/reset.css',
    '/da/styles/toastr.min.css',
    '/da/scripts/app.js',
    '/da/scripts/PseudoCodeParser.js',
    '/da/scripts/libraries/jquery-3.2.1.min.js',
    '/da/scripts/libraries/toastr.min.js',
];

async function addAllToCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(urlsToCache)
    } catch (err) {
        console.error(err);
    }
}

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(addAllToCache());
});

self.addEventListener('activate', function(event) {
    console.debug('Service worker is activated!');
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && networkResponse.url.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone())
                    }
                })

                return response || fetchPromise;
            })
        })
    );
});