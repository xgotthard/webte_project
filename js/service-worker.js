self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-assets').then((cache) => {
            return cache.addAll([
                '/index.html',
                '/style.css',
                '/js/game.js',
                '/levels.json',
                '/assets/background.png',
                '/assets/ball.png',
                '/assets/block_blue.png',
                '/assets/block_darkblue.png',
                '/assets/block_green.png',
                '/assets/block_orange.png',
                '/assets/block_pink.png',
                '/assets/block_red.png',
                '/assets/block_turquoise.png',
                '/assets/block_yellow.png',
                '/assets/paddle.png',
                '/assets/pause_button1.png',
                '/assets/restart.png'
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