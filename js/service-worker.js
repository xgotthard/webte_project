self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-assets').then((cache) => {
            return cache.addAll([
                '/index.html',
                '/style.css',
                '/js/game.js',
                '/levels.json',
                '/assets/'
            ]);
        })
    );
});
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});