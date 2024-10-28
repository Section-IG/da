const CACHE_NAME = 'IESN_IG_DA';
// TODO: find a way to automatically retrieve files to cache
// at the moment, it is acceptable to let this list hardcoded, see comments on https://github.com/IESN-IG/da/pull/1
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
    event.waitUntil(addAllToCache());
});

self.addEventListener('activate', function(_) {
    console.debug('Service worker is activated!');
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
    event.respondWith(cacheNetworkRace(event));
});

async function cacheNetworkRace(event) {
    try {
        const cache = await caches.open(CACHE_NAME);
        return await Promise.any([cacheFetch(cache, event.request), networkFetch(cache, event.request)]);
    } catch (error) {
        console.error("Not found in cache or network", error);
    }
}

async function cacheFetch(cache, request) {
    const response = await cache.match(request);
    if (response) return response;
    throw new Error('Request not cached');
}

async function networkFetch(cache, request) {
    try {
        const response = await fetch(request)
        if (response && response.status === 200 && response.type === 'basic' && response.url.startsWith('https')) {
            cache.put(request, response.clone());
        }    
        return response;
    } catch (error) {
        throw error
    }
}