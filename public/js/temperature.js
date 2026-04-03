/**
 * Logique de gestion de la température et du graphique
 * Intègre la stratégie de mise en cache LocalStorage pour la PWA (Lot 3)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. RÉCUPÉRATION DES ÉLÉMENTS HTML ---
  const O_pTab1 = document.getElementById("current-temp");
  const O_chartBox = document.getElementById("chartBox");
  const canvas = document.getElementById("historyChart");

  // Sécurité : si les éléments ne sont pas sur la page, on arrête le script
  if (!O_pTab1 || !canvas) return;

  const ctx = canvas.getContext("2d");

  // --- 2. INITIALISATION DU GRAPHIQUE CHART.JS ---
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

  // --- 3. FONCTION DE MISE À JOUR DE L'INTERFACE ---
  // Cette fonction est appelée pour le temps réel ET le mode hors-ligne
  function updateInterface(I_value) {
    // Mise à jour du texte affiché
    O_pTab1.textContent = `${I_value}°C`;

    // Préparation du label de temps
    const now = new Date();
    const timeLabel =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0") +
      ":" +
      now.getSeconds().toString().padStart(2, "0");

    // Mise à jour des données du graphique
    historyChart.data.labels.push(timeLabel);
    historyChart.data.datasets[0].data.push(I_value);

    // Ajustement dynamique pour le scroll horizontal
    if (historyChart.data.labels.length > 15) {
      const newWidth = historyChart.data.labels.length * 40;
      if (O_chartBox) O_chartBox.style.width = newWidth + "px";

      const container = O_chartBox.parentElement;
      if (container) container.scrollLeft = container.scrollWidth;
    }

    historyChart.update();

    // Ajout à la liste d'historique textuelle
    let O_history = document.getElementById("history-tab-text");
    if (!O_history) {
      O_history = document.createElement("ul");
      O_history.id = "history-tab-text";
      document.getElementById("tabpanel-2").appendChild(O_history);
    }
    let O_li = document.createElement("li");
    O_li.textContent = `${timeLabel} : ${I_value}°C`;
    O_history.appendChild(O_li);
    O_history.scrollTop = O_history.scrollHeight;

    // SAUVEGARDE LOCALE POUR LA PWA (Alternative WebSocket hors-ligne)
    localStorage.setItem("lastTemperature", I_value);
  }

  // --- 4. GESTION DU MODE HORS-LIGNE (Lot 3) ---
  // Au chargement, si on n'a pas de réseau, on affiche la dernière valeur connue
  if (!navigator.onLine) {
    const savedData = localStorage.getItem("lastTemperature");
    if (savedData) {
      console.log("Mode hors-ligne : chargement des données locales");
      updateInterface(savedData);
    }
  }

  // --- 5. LOGIQUE DE GÉNÉRATION / RÉCEPTION DES DONNÉES ---
  let A_temperatureValues = [];

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Simulation de données initiales
  for (let i = 0; i < 20; i++) {
    A_temperatureValues.push(random(-20, 40));
  }

  // Intervalle de mise à jour (toutes les 2 secondes)
  // En production, cela serait remplacé par l'écouteur du WebSocket
  setInterval(() => {
    if (navigator.onLine) {
      let I_value = A_temperatureValues[random(0, 19)];
      updateInterface(I_value);
    }
  }, 2000);
});
