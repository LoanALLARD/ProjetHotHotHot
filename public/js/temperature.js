// Définition du tableau
let A_temperatureValues = [];

// Génère 1 entier aléatoire compris entre 'min' et 'max'
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

// Génère un nombre d'entiers 'iterations' dans A_temperatureValues
function generateInts(iterations) {
    for (let I_i = 0; I_i < iterations; ++I_i) {
        A_temperatureValues[I_i] = random(-20, 40);
        console.log(A_temperatureValues[I_i]);
    }
}

// Appel de la fonction
generateInts(20);

// Récupère un entier aléatoire dans un tableau 'array'
function getRandomIntIntoArray(array) {
    I_rand = random(0, 19);
    return array[I_rand];
}

// Récupération et création des différents éléments
let O_pTab1 = document.getElementById("current-temp");

// Initialisation du graphique Chart.js
const ctx = document.getElementById("historyChart").getContext("2d");
const historyChart = new Chart(ctx, {
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

let timeIndex = 0;

// Change le contenu du <p> toutes les 2 secondes
O_pTab1.textContent = ""; // Initialisation du contenu
setInterval(() => {
    let I_value = getRandomIntIntoArray(A_temperatureValues);

    // Mise à jour de la température affichée dans le carré
    O_pTab1.textContent = `${I_value}°C`;

    // Mise à jour du graphique Chart.js
    const now = new Date();
    const timeLabel =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0");

    historyChart.data.labels.push(timeLabel);
    historyChart.data.datasets[0].data.push(I_value);

    // Ajuster dynamiquement la largeur du conteneur pour créer le scoll horizontal
    if (historyChart.data.labels.length > 15) {
        const newWidth = historyChart.data.labels.length * 40; // 40px par point
        document.getElementById("chartBox").style.width = newWidth + "px";

        // Optionnel : defiler automatiquement le graphique vers la droite
        const container = document.getElementById("chartBox").parentElement;
        container.scrollLeft = container.scrollWidth;
    }

    historyChart.update();

    // Affichage de l'historique (ajout en bas de la liste)
    let O_history = document.getElementById("history-tab-text");
    if (!O_history) {
        O_history = document.createElement("ul");
        O_history.id = "history-tab-text";
        document.getElementById("tabpanel-2").appendChild(O_history);
    }
    let O_li = document.createElement("li");
    O_li.textContent = `${timeLabel} : ${I_value}°C`;
    O_history.appendChild(O_li);
    O_history.scrollTop = O_history.scrollHeight; // Scroll automatique vers le bas
}, 2000);
