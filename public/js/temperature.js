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
    // Si Chart.js ne charge pas (ex: CDN inaccessible hors ligne)
    if (O_chartBox)
      O_chartBox.innerHTML =
        '<p style="text-align:center; padding-top:20px; color:#c62828;">Graphique indisponible hors ligne.</p>';
  }

  // --- FONCTION DE RENDU D'HISTORIQUE ---
  function renderHistoryEntry(timeLabel, I_value) {
    if (historyChart) {
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
    }

    // Ajout à la liste d'historique textuelle
    let O_history = document.getElementById("history-tab-text");
    if (!O_history) {
      O_history = document.createElement("ul");
      O_history.id = "history-tab-text";
      const tabpanel2 = document.getElementById("tabpanel-2");
      if (tabpanel2) tabpanel2.appendChild(O_history);
    }
    let O_li = document.createElement("li");
    O_li.textContent = `${timeLabel} : ${I_value}°C`;
    O_history.appendChild(O_li);
    O_history.scrollTop = O_history.scrollHeight;
  }

  // --- 3. FONCTION DE MISE À JOUR DE L'INTERFACE ---
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

    renderHistoryEntry(timeLabel, I_value);

    // SAUVEGARDE LOCALE POUR LA PWA
    localStorage.setItem("lastTemperature", I_value);

    let history = JSON.parse(
      localStorage.getItem("temperatureHistory") || "[]",
    );
    history.push({ time: timeLabel, value: I_value });
    // Limite à 50 entrées max pour ne pas surcharger le localStorage
    if (history.length > 50) history.shift();
    localStorage.setItem("temperatureHistory", JSON.stringify(history));
  }

  // --- 4. GESTION DU MODE HORS-LIGNE (Lot 3) ---
  if (!navigator.onLine) {
    const savedData = localStorage.getItem("lastTemperature");
    const savedHistory = JSON.parse(
      localStorage.getItem("temperatureHistory") || "[]",
    );

    if (savedData) {
      console.log("Mode hors-ligne : chargement des données locales");
      O_pTab1.textContent = `${savedData}°C`;
    }

    if (savedHistory.length > 0) {
      // S'il y a des données d'historique, on les affiche
      savedHistory.forEach((item) => renderHistoryEntry(item.time, item.value));
    } else {
      // S'il n'y a AUCUNE donnée, on affiche le message
      const tabpanel2 = document.getElementById("tabpanel-2");
      if (tabpanel2) {
        tabpanel2.innerHTML =
          '<p style="margin:20px; font-weight:bold; color:#d32f2f;">Aucun donnée disponible dans l\'historique. Mode hors ligne activé.</p>';
      }
    }
  }

  // Écouteurs pour le basculement En ligne / Hors ligne
  window.addEventListener("offline", () => {
    const history = JSON.parse(
      localStorage.getItem("temperatureHistory") || "[]",
    );
    if (history.length === 0) {
      const tabpanel2 = document.getElementById("tabpanel-2");
      if (tabpanel2) {
        tabpanel2.innerHTML =
          '<p style="margin:20px; font-weight:bold; color:#d32f2f;">Aucun donnée disponible dans l\'historique. Mode hors ligne activé.</p>';
      }
    }
  });

  // --- 5. LOGIQUE DE GÉNÉRATION / RÉCEPTION DES DONNÉES ---
  let A_temperatureValues = [];
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  for (let i = 0; i < 20; i++) {
    A_temperatureValues.push(random(-20, 40));
  }

  setInterval(() => {
    if (navigator.onLine) {
      let I_value = A_temperatureValues[random(0, 19)];
      updateInterface(I_value);
    }
  }, 2000);
});
