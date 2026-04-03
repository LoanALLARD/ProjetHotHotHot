// Définition de l'objet contenant les statistiques (min/max)
let O_stats = {
    int: { min: Infinity, max: -Infinity },
    ext: { min: Infinity, max: -Infinity },
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
    scales: { y: { suggestedMin: -10, suggestedMax: 50 } },
};

// Initialisation du graphique de simulation (Rouge)
const O_ctxSim = document.getElementById("simChart")?.getContext("2d");
let O_simChart = null;
if (O_ctxSim) {
    O_simChart = new Chart(O_ctxSim, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Température Simulée (°C)",
                    data: [],
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                },
            ],
        },
        options: O_commonChartOptions,
    });
}

// Initialisation du graphique réel (Bleu)
const O_ctxReal = document.getElementById("realChart")?.getContext("2d");
let O_realChart = null;
if (O_ctxReal) {
    O_realChart = new Chart(O_ctxReal, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Température Réelle (°C)",
                    data: [],
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                },
            ],
        },
        options: O_commonChartOptions,
    });
}

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
    if (S_type === "ext") {
        if (I_value > 35) S_message = "Hot Hot Hot !";
        else if (I_value < 0) S_message = "Banquise en vue !";
    } else if (S_type === "int") {
        if (I_value > 50)
            S_message = "Appelez les pompiers ou arrêtez votre barbecue !";
        else if (I_value > 22 && I_value <= 50)
            S_message = "Baissez le chauffage !";
        else if (I_value < 0)
            S_message =
                "Canalisations gelées, appelez SOS plombier et mettez un bonnet !";
        else if (I_value < 12 && I_value >= 0)
            S_message = "Montez le chauffage ou mettez un gros pull !";
    }
    if (S_message !== "") triggerAlert(S_message, S_type, I_value);
}

// Déclenche et affiche l'alerte à l'utilisateur
function triggerAlert(S_message, S_type, I_value) {
    const S_time = new Date().toLocaleTimeString();
    const S_sensorName = S_type === "ext" ? "Extérieur" : "Intérieur";

    // Ajout à l'historique des alertes
    A_pastAlerts.push({ S_message, S_type, I_value, S_time, S_sensorName });

    // Affichage dans la modale
    const O_modal = document.getElementById("alert-modal");
    const O_alertMessageEl = document.getElementById("alert-message");
    if (O_modal && O_alertMessageEl) {
        O_alertMessageEl.textContent = `${S_message} (${S_sensorName}: ${I_value}°C)`;
        if (!O_modal.open) O_modal.showModal();
    }

    // Affichage de la notification système
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Alerte HotHotHot", {
            body: `${S_message}\nTempérature : ${I_value}°C (${S_sensorName})`,
            icon: "assets/images/logo.png",
        });
    }

    // Ajout à la liste affichée dans le DOM
    const O_pastAlertsList = document.getElementById("past-alerts-list");
    if (O_pastAlertsList) {
        const O_li = document.createElement("li");
        O_li.textContent = `[${S_time}] ${S_sensorName} (${I_value}°C) : ${S_message}`;
        O_pastAlertsList.prepend(O_li);
    }
}

// Récupération des éléments texte pour la température
let O_pTab1Sim = document.getElementById("current-temp-sim");
let O_pTab1Real = document.getElementById("current-temp-real");

// Boucle de simulation (Toutes les 5 secondes)
setInterval(() => {
    let I_valSim = random(-10, 60);
    const S_timeLabel = new Date().toLocaleTimeString();

    // Mise à jour de l'affichage texte
    if (O_pTab1Sim) {
        O_pTab1Sim.innerHTML = `<strong>${I_valSim}°C</strong>`;
    }

    // Ajout au graphique simulé
    if (O_simChart) {
        O_simChart.data.labels.push(S_timeLabel);
        O_simChart.data.datasets[0].data.push(I_valSim);

        // Ajuster dynamiquement la largeur du conteneur pour créer le scroll horizontal
        if (O_simChart.data.labels.length > 15) {
            document.getElementById("simChartBox").style.width =
                O_simChart.data.labels.length * 40 + "px";
            const O_container =
                document.getElementById("simChartBox").parentElement;
            O_container.scrollLeft = O_container.scrollWidth;
        }
        O_simChart.update();
    }
}, 5000);

// Boucle réelle via WebSocket
try {
    let O_socket = new WebSocket("wss://ws.hothothot.dog:9502");

    // Ouverture de la connexion
    O_socket.onopen = function (O_event) {
        console.log("Connexion WebSocket établie avec le vrai capteur");
        O_socket.send("coucou !"); // Message initial requis par le serveur
    };

    // Réception des messages du WebSocket
    O_socket.onmessage = function (O_event) {
        // On tente de récupérer la valeur en tant que nombre
        let I_valReal = parseFloat(O_event.data);

        if (!isNaN(I_valReal)) {
            const S_timeLabel = new Date().toLocaleTimeString();

            // Mise à jour de la température actuelle dans le premier onglet si nécessaire
            if (O_pTab1Real) {
                O_pTab1Real.innerHTML = `<strong>${I_valReal}°C</strong>`;
            }

            // Mise à jour des statistiques et des alertes sur la VRAIE valeur
            updateStats("ext", I_valReal); // Par exemple on le considère comme capteur Extérieur
            checkAlerts("ext", I_valReal);

            // Ajout au graphique réel
            if (O_realChart) {
                O_realChart.data.labels.push(S_timeLabel);
                O_realChart.data.datasets[0].data.push(I_valReal);

                // Ajuster dynamiquement la largeur du conteneur pour créer le scroll horizontal
                if (O_realChart.data.labels.length > 15) {
                    document.getElementById("realChartBox").style.width =
                        O_realChart.data.labels.length * 40 + "px";
                    const O_container =
                        document.getElementById("realChartBox").parentElement;
                    O_container.scrollLeft = O_container.scrollWidth;
                }
                O_realChart.update();
            }

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
} catch (O_e) {
    console.error("Erreur de connexion WebSocket : ", O_e);
}

// Gestion de l'affichage des alertes passées (100% JS)
document.addEventListener("DOMContentLoaded", () => {
    const O_btnShowAlerts = document.getElementById("show-past-alerts");
    const O_pastAlertsList = document.getElementById("past-alerts-list");

    if (O_btnShowAlerts && O_pastAlertsList) {
        O_pastAlertsList.style.display = "none";

        // Evénement au clic pour afficher ou masquer la liste
        O_btnShowAlerts.addEventListener("click", () => {
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

// --- RÉINTÉGRATION DES FONCTIONNALITÉS PWA / HISTORIQUE SUITE AU MERGE ---
document.addEventListener("DOMContentLoaded", () => {
    // On prend les éléments HTML dont on a besoin
    const O_pTab1Sim = document.getElementById("current-temp-sim");
    const O_chartBox = document.getElementById("chartBox");
    const canvas = document.getElementById("historyChart");

    // Sécurité : si on n'est pas sur la bonne page, on arrête tout
    if (!O_pTab1Sim || !canvas) return;

    const ctx = canvas.getContext("2d");

    // Config de base de Chart.js pour le graphique en ligne (avec sécurité hors-ligne)
    let historyChart = null;
    if (typeof Chart !== "undefined") {
        historyChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Historique des températures (°C)",
                        data: [],
                        borderColor: "rgba(255, 99, 132, 1)",
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: -20,
                        suggestedMax: 40,
                    },
                },
            },
        });
    } else {
        if (O_chartBox) {
            O_chartBox.innerHTML =
                '<p style="text-align:center; padding-top:20px; color:#c62828;">Graphique indisponible hors ligne.</p>';
        }
    }

    // La grosse fonction qui met à jour l'affichage partout
    function updateInterface(I_value) {
        // Ne met pas à jour le gros carré ici (pour éviter les conflits avec le websocket)
        // O_pTab1Sim géré séparément

        // Petit formatage de l'heure pour les labels
        const now = new Date();
        const timeLabel =
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0") +
            ":" +
            now.getSeconds().toString().padStart(2, "0");

        // On ajoute les nouvelles infos dans le graphique
        if (historyChart) {
            historyChart.data.labels.push(timeLabel);
            historyChart.data.datasets[0].data.push(I_value);

            // Si y'a trop de points, on agrandit la zone pour pouvoir scroller horizontalement
            if (historyChart.data.labels.length > 15) {
                const newWidth = historyChart.data.labels.length * 40;
                if (O_chartBox) O_chartBox.style.width = newWidth + "px";

                const container = O_chartBox ? O_chartBox.parentElement : null;
                if (container) container.scrollLeft = container.scrollWidth;
            }

            historyChart.update();
        }

        // Ajout d'une ligne dans la liste textuelle de l'onglet Historique
        let O_history = document.getElementById("history-tab-text");
        if (!O_history) {
            O_history = document.createElement("ul");
            O_history.id = "history-tab-text";
            const tabpanel2 = document.getElementById("tabpanel-2");
            if (tabpanel2) tabpanel2.appendChild(O_history);
        }
        if (O_history) {
            let O_li = document.createElement("li");
            O_li.textContent = `${timeLabel} : ${I_value}°C`;
            O_history.appendChild(O_li);
            O_history.scrollTop = O_history.scrollHeight;
        }

        // Stratégie PWA : On sauvegarde la valeur pour le mode hors-ligne
        localStorage.setItem("lastTemperature", I_value);
    }

    // Check au démarrage : si on n'est pas en ligne, on charge la dernière valeur
    if (!navigator.onLine) {
        const savedData = localStorage.getItem("lastTemperature");
        if (savedData) {
            updateInterface(savedData);
        }
    }

    // Simulateur de données : on génère des valeurs aléatoires pour tester l'interface
    let A_temperatureValues = [];

    function localRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // On crée un petit stock de valeurs aléatoires
    for (let i = 0; i < 20; i++) {
        A_temperatureValues.push(localRandom(-20, 40));
    }

    // On lance la boucle de mise à jour toutes les 2 secondes
    setInterval(() => {
        // On ne met à jour que si on est en ligne
        if (navigator.onLine) {
            let I_value = A_temperatureValues[localRandom(0, 19)];
            updateInterface(I_value);
        }
    }, 2000);
});
