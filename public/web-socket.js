const wsUri = "wss://ws.hothothot.dog:9502";
let websocket = null;
let pingInterval;
let counter = 0; // Compteur qui garde une trace du nombre de pings envoyés et de messages reçus.

function initializeWebSocketListeners(ws) {
    // Écoute les messages du serveur
    ws.addEventListener("open", () => {
        console.log("CONNECTED");
        pingInterval = setInterval(() => {
            console.log(`SENT: ping: ${counter}`);
            ws.send("ping");
        }, 1000);
    });

    // Écoute la fermeture de la connexion
    ws.addEventListener("close", () => {
        console.log("DISCONNECTED");
        clearInterval(pingInterval);
    });

    // Écoute les messages du serveur
    ws.addEventListener("message", (e) => {
        console.log(`RECEIVED: ${e.data}: ${counter}`);
        counter++;
    });

    // Écoute les erreurs
    ws.addEventListener("error", (e) => {
        console.log(`ERROR`);
    });
}

// Reconnecte le websocket si la page est chargée à partir du cache de navigation
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        websocket = new WebSocket(wsUri);
        initializeWebSocketListeners(websocket);
    }
});

console.log("OPENING");
websocket = new WebSocket(wsUri);
initializeWebSocketListeners(websocket); // Ouvre le websocket dès que la page est chargée

// Ferme le websocket lorsque l'utilisateur quitte la page.
window.addEventListener("pagehide", () => {
    if (websocket) {
        console.log("CLOSING");
        websocket.close();
        websocket = null;
        window.clearInterval(pingInterval);
    }
});
