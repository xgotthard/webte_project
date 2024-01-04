self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('game-assets').then((cache) => {
            return cache.addAll([
               '/Sem_project/style.css',
               '/Sem_project/js/game.js',
               '/Sem_project/levels.json',
               '/Sem_project/assets/background.png',
               '/Sem_project/assets/ball.png',
               '/Sem_project/assets/block_blue.png',
               '/Sem_project/assets/block_darkblue.png',
               '/Sem_project/assets/block_green.png',
               '/Sem_project/assets/block_orange.png',
               '/Sem_project/assets/block_pink.png',
               '/Sem_project/assets/block_red.png',
               '/Sem_project/assets/block_turquoise.png',
               '/Sem_project/assets/block_yellow.png',
               '/Sem_project/assets/paddle.png',
               '/Sem_project/assets/pause_button1.png',
               '/Sem_project/assets/restart.png',
               '/Sem_project/assets/information_button.png',
               '/Sem_project/assets/info-icon.png',
               '/Sem_project/assets/play_btn.png',
               '/Sem_project/index.html',
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