// Définition de l'objet contenant les statistiques (min/max)
let O_stats = {
    int: { min: Infinity, max: -Infinity },
    ext: { min: Infinity, max: -Infinity }
};

// Définition du tableau des alertes passées
let A_pastAlerts = [];

// Demande de permission pour les notifications système
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Génère 1 entier aléatoire compris entre 'min' et 'max'
function random(min, max) {
    const I_num = Math.floor(Math.random() * (max - min + 1)) + min;
    return I_num;
}

// Configuration commune pour les graphiques Chart.js
const O_commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { suggestedMin: -10, suggestedMax: 50 } }
};

// Initialisation du graphique de simulation (Rouge)
const O_ctxSim = document.getElementById("simChart").getContext("2d");
const O_simChart = new Chart(O_ctxSim, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Température Simulée (°C)",
            data: [],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2, tension: 0.3, fill: true
        }]
    },
    options: O_commonChartOptions
});

// Initialisation du graphique réel (Bleu)
const O_ctxReal = document.getElementById("realChart").getContext("2d");
const O_realChart = new Chart(O_ctxReal, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Température Réelle (°C)",
            data: [],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2, tension: 0.3, fill: true
        }]
    },
    options: O_commonChartOptions
});

// Met à jour les statistiques minimales et maximales
function updateStats(S_type, I_value) {
    if (I_value < O_stats[S_type].min) O_stats[S_type].min = I_value;
    if (I_value > O_stats[S_type].max) O_stats[S_type].max = I_value;

    const O_minEl = document.getElementById(`min-${S_type}`);
    const O_maxEl = document.getElementById(`max-${S_type}`);

    if (O_minEl) O_minEl.textContent = O_stats[S_type].min;
    if (O_maxEl) O_maxEl.textContent = O_stats[S_type].max;
}

// Vérifie si une alerte doit être déclenchée en fonction de la température
function checkAlerts(S_type, I_value) {
    let S_message = "";
    if (S_type === 'ext') {
        if (I_value > 35) S_message = "Hot Hot Hot !";
        else if (I_value < 0) S_message = "Banquise en vue !";
    } else if (S_type === 'int') {
        if (I_value > 50) S_message = "Appelez les pompiers ou arrêtez votre barbecue !";
        else if (I_value > 22 && I_value <= 50) S_message = "Baissez le chauffage !";
        else if (I_value < 0) S_message = "Canalisations gelées, appelez SOS plombier et mettez un bonnet !";
        else if (I_value < 12 && I_value >= 0) S_message = "Montez le chauffage ou mettez un gros pull !";
    }
    if (S_message !== "") triggerAlert(S_message, S_type, I_value);
}

// Déclenche et affiche l'alerte à l'utilisateur
function triggerAlert(S_message, S_type, I_value) {
    const S_time = new Date().toLocaleTimeString();
    const S_sensorName = S_type === 'ext' ? 'Extérieur' : 'Intérieur';

    // Ajout à l'historique des alertes
    A_pastAlerts.push({ S_message, S_type, I_value, S_time, S_sensorName });

    // Affichage dans la modale
    const O_modal = document.getElementById('alert-modal');
    const O_alertMessageEl = document.getElementById('alert-message');
    if (O_modal && O_alertMessageEl) {
        O_alertMessageEl.textContent = `${S_message} (${S_sensorName}: ${I_value}°C)`;
        if (!O_modal.open) O_modal.showModal();
    }

    // Affichage de la notification système
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Alerte HotHotHot", {
            body: `${S_message}\nTempérature : ${I_value}°C (${S_sensorName})`,
            icon: "assets/images/logo.png"
        });
    }

    // Ajout à la liste affichée dans le DOM
    const O_pastAlertsList = document.getElementById('past-alerts-list');
    if (O_pastAlertsList) {
        const O_li = document.createElement('li');
        O_li.textContent = `[${S_time}] ${S_sensorName} (${I_value}°C) : ${S_message}`;
        O_pastAlertsList.prepend(O_li);
    }
}

// Récupération de l'élément texte pour la température simulée
let O_pTab1 = document.getElementById("current-temp");

// Boucle de simulation (Toutes les 5 secondes)
setInterval(() => {
    let I_valSim = random(-10, 60);
    const S_timeLabel = new Date().toLocaleTimeString();

    // Mise à jour de l'affichage texte
    if (O_pTab1) {
        O_pTab1.innerHTML = `Simulation : <strong>${I_valSim}°C</strong>`;
    }

    // Ajout au graphique simulé
    O_simChart.data.labels.push(S_timeLabel);
    O_simChart.data.datasets[0].data.push(I_valSim);

    // Ajuster dynamiquement la largeur du conteneur pour créer le scroll horizontal
    if (O_simChart.data.labels.length > 15) {
        document.getElementById("simChartBox").style.width = (O_simChart.data.labels.length * 40) + "px";
        const O_container = document.getElementById("simChartBox").parentElement;
        O_container.scrollLeft = O_container.scrollWidth;
    }
    O_simChart.update();

}, 5000);

// Boucle réelle via WebSocket
try {
    let O_socket = new WebSocket('wss://ws.hothothot.dog:9502');

    // Ouverture de la connexion
    O_socket.onopen = function(O_event) {
        console.log("Connexion WebSocket établie avec le vrai capteur");
        O_socket.send("coucou !"); // Message initial requis par le serveur
    };

    // Réception des messages du WebSocket
    O_socket.onmessage = function(O_event) {
        // On tente de récupérer la valeur en tant que nombre
        let I_valReal = parseFloat(O_event.data);

        if (!isNaN(I_valReal)) {
            const S_timeLabel = new Date().toLocaleTimeString();

            // Mise à jour des statistiques et des alertes sur la VRAIE valeur
            updateStats('ext', I_valReal); // Par exemple on le considère comme capteur Extérieur
            checkAlerts('ext', I_valReal);

            // Ajout au graphique réel
            O_realChart.data.labels.push(S_timeLabel);
            O_realChart.data.datasets[0].data.push(I_valReal);

            // Ajuster dynamiquement la largeur du conteneur pour créer le scroll horizontal
            if (O_realChart.data.labels.length > 15) {
                document.getElementById("realChartBox").style.width = (O_realChart.data.labels.length * 40) + "px";
                const O_container = document.getElementById("realChartBox").parentElement;
                O_container.scrollLeft = O_container.scrollWidth;
            }
            O_realChart.update();

            // Affichage dans l'historique texte brut
            let O_history = document.getElementById("history-tab-text");
            if (O_history) {
                let O_li = document.createElement("li");
                O_li.textContent = `${S_timeLabel} - Réel: ${I_valReal}°C`;
                O_history.appendChild(O_li);
                O_history.scrollTop = O_history.scrollHeight; // Scroll automatique vers le bas
            }
        }
    };
} catch(O_e) {
    console.error("Erreur de connexion WebSocket : ", O_e);
}

// Gestion de l'affichage des alertes passées (100% JS)
document.addEventListener("DOMContentLoaded", () => {
    const O_btnShowAlerts = document.getElementById('show-past-alerts');
    const O_pastAlertsList = document.getElementById('past-alerts-list');

    if (O_btnShowAlerts && O_pastAlertsList) {
        O_pastAlertsList.style.display = "none";

        // Evénement au clic pour afficher ou masquer la liste
        O_btnShowAlerts.addEventListener('click', () => {
            if (O_pastAlertsList.style.display === "none") {
                O_pastAlertsList.style.display = "block";
                O_btnShowAlerts.textContent = "Masquer les alertes passées";
            } else {
                O_pastAlertsList.style.display = "none";
                O_btnShowAlerts.textContent = "Voir les alertes passées";
            }
        });
    }
});