document.addEventListener("DOMContentLoaded", () => {
  // On prend les éléments HTML dont on a besoin
  const O_pTab1 = document.getElementById("current-temp");
  const O_chartBox = document.getElementById("chartBox");
  const canvas = document.getElementById("historyChart");

  // Sécurité : si on n'est pas sur la bonne page, on arrête tout pour pas avoir d'erreurs
  if (!O_pTab1 || !canvas) return;

  const ctx = canvas.getContext("2d");

  // Config de base de Chart.js pour le graphique en ligne
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

  // La grosse fonction qui met à jour l'affichage partout
  function updateInterface(I_value) {
    // Affiche la température dans le gros carré
    O_pTab1.textContent = `${I_value}°C`;

    // Petit formatage de l'heure pour les labels
    const now = new Date();
    const timeLabel =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0") +
      ":" +
      now.getSeconds().toString().padStart(2, "0");

    // On ajoute les nouvelles infos dans le graphique
    historyChart.data.labels.push(timeLabel);
    historyChart.data.datasets[0].data.push(I_value);

    // Si y'a trop de points, on agrandit la zone pour pouvoir scroller horizontalement
    if (historyChart.data.labels.length > 15) {
      const newWidth = historyChart.data.labels.length * 40;
      if (O_chartBox) O_chartBox.style.width = newWidth + "px";

      const container = O_chartBox.parentElement;
      if (container) container.scrollLeft = container.scrollWidth;
    }

    historyChart.update();

    // Ajout d'une ligne dans la liste textuelle de l'onglet Historique
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

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // On crée un petit stock de valeurs aléatoires
  for (let i = 0; i < 20; i++) {
    A_temperatureValues.push(random(-20, 40));
  }

  // On lance la boucle de mise à jour toutes les 2 secondes
  setInterval(() => {
    // On ne met à jour que si on est en ligne
    if (navigator.onLine) {
      let I_value = A_temperatureValues[random(0, 19)];
      updateInterface(I_value);
    }
  }, 2000);
});
