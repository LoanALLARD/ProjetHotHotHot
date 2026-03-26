let CACHE = "my-site-cache";

self.addEventListener('install', function(evt) {
    evt.waitUntil(caches.open(CACHE).then(function (cache) {
        cache.addAll([
            '/public/assets/images/favicon.ico',
            '/public/assets/images/logo.png',
            '/sw.js'
        ]);
    }));
});

// Test notification

const button = document.getElementById('notification-button');

button.addEventListener('click',(e) => {
    Notification.requestPermission().then((result) => {
        if (result === 'granted') {
            randomNotification();
        }
    });
});

function randomNotification() {
    let randomNumber = getRandomInt(5);
    console.log(randomNumber);
    if(randomNumber >= 2) {

        let notifTitle = "Chaud, non ?";
        let notifBody = 'Température : ' + randomNumber + '.';
        let notifImg = '/assets/images/android-chrome-192x192.png';
        let options = {
            body: notifBody,
            icon: notifImg
        }
        let notif = new Notification(notifTitle, options);
    }
    setTimeout(randomNotification, 30000);
}



//On génére un nombre aléatoire pour la démo
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}