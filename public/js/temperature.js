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

// Change le contenu du <p> toutes les 2 secondes
O_pTab1.textContent = ""; // Initialisation du contenu
setInterval(() => {
    let I_value = getRandomIntIntoArray(A_temperatureValues);

    // Mise à jour de la température affichée dans le carré
    O_pTab1.textContent = `${I_value}°C`;

    // Affichage de l'historique (ajout en bas de la liste)
    let O_history = document.getElementById("history-tab-text");
    if (!O_history) {
        O_history = document.createElement("ul");
        O_history.id = "history";
        O_section1.appendChild(O_history);
    }
    let O_li = document.createElement("li");
    O_li.textContent = `${I_value}°C`;
    O_history.appendChild(O_li);
    O_history.scrollTop = O_history.scrollHeight; // Scroll automatique vers le bas
}, 2000);
