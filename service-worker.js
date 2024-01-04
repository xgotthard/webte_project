self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-assets').then((cache) => {
            return cache.addAll([
               '/~xstefinova/webte_project/style.css',
               '/~xstefinova/webte_project/js/game.js',
               '/~xstefinova/webte_project/levels.json',
               '/~xstefinova/webte_project/assets/background.png',
               '/~xstefinova/webte_project/assets/ball.png',
               '/~xstefinova/webte_project/assets/block_blue.png',
               '/~xstefinova/webte_project/assets/block_darkblue.png',
               '/~xstefinova/webte_project/assets/block_green.png',
               '/~xstefinova/webte_project/assets/block_orange.png',
               '/~xstefinova/webte_project/assets/block_pink.png',
               '/~xstefinova/webte_project/assets/block_red.png',
               '/~xstefinova/webte_project/assets/block_turquoise.png',
               '/~xstefinova/webte_project/assets/block_yellow.png',
               '/~xstefinova/webte_project/assets/paddle.png',
               '/~xstefinova/webte_project/assets/pause_button1.png',
               '/~xstefinova/webte_project/assets/restart.png',
               '/~xstefinova/webte_project/assets/information_button.png',
               '/~xstefinova/webte_project/assets/info-icon.png',
               '/~xstefinova/webte_project/assets/play_btn.png',
               '/~xstefinova/webte_project/index.html',
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