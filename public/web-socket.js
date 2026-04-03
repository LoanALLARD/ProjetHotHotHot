const wsUri = "wss://ws.hothothot.dog:9502";
let websocket = null;
let pingInterval;
let counter = 0; // Counter to keep track of the number of pings sent and messages received.

function initializeWebSocketListeners(ws) {

    // Listen for messages
    ws.addEventListener("open", () => {
        console.log("CONNECTED");
        pingInterval = setInterval(() => {
            console.log(`SENT: ping: ${counter}`);
            ws.send("ping");
        }, 1000);
    });

    // Listen for close
    ws.addEventListener("close", () => {
        console.log("DISCONNECTED");
        clearInterval(pingInterval);
    });

    // Listen for messages
    ws.addEventListener("message", (e) => {
        console.log(`RECEIVED: ${e.data}: ${counter}`);
        counter++;
    });

    // Listen for errors
    ws.addEventListener("error", (e) => {
        console.log(`ERROR`);
    });
}

// Reconnect the websocket if the page is loaded from the bfcache (back-forward cache).
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        websocket = new WebSocket(wsUri);
        initializeWebSocketListeners(websocket);
    }
});

console.log("OPENING");
websocket = new WebSocket(wsUri);
initializeWebSocketListeners(websocket); // Open the websocket when the page loads.

// Close the websocket when the user leaves.
window.addEventListener("pagehide", () => {
    if (websocket) {
        console.log("CLOSING");
        websocket.close();
        websocket = null;
        window.clearInterval(pingInterval);
    }
});
