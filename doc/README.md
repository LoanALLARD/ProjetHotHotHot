# Architecture du Projet Hot Hot Hot

Ce document décrit l'organisation des fichiers et dossiers du projet pour un fonctionnement optimal avec HTML, CSS, JavaScript et les connexions WebSockets.

## Structure globale

```text
ProjetHotHotHot/
├── assets/                # Fichiers statiques (ressources globales)
│   ├── images/            # Images, logos, icônes
│   └── fonts/             # Polices de caractères locales
│
├── css/                   # Feuilles de style
│   ├── style.css          # Styles principaux de l'interface
│   └── responsive.css     # (Optionnel) Règles d'adaptation pour mobile/tablette
│
├── js/                    # Scripts JavaScript côté client
│   ├── app.js             # Logique principale de l'interface (Manipulation DOM, événements)
│   ├── websocket.js       # Module dédié à la gestion de la connexion WebSocket (onopen, onmessage)
│   └── utils.js           # (Optionnel) Fonctions utilitaires réutilisables
│
├── server/                # (Si applicable) Script serveur hébergeant le WebSocket
│   └── server.js          # Serveur (ex: Node.js) pour gérer les connexions entrantes
│
├── doc/                   # Documentation technique du projet (ce dossier)
│   └── README.md          # Document détaillant l'architecture
│
├── about.html             # Page HTML : À propos
├── documentation.html     # Page HTML : Documentation
├── index.html             # Page HTML : Flux principal ou tableau de bord
├── logout.html            # Page HTML : Écran de déconnexion
├── package.json           # Fichier de configuration NPM (dépendances et scripts comme "dev")
└── README.md              # Point d'entrée informatif du dépôt Git
```

## Conventions de nommage et de séparation

1. **Vues (fichiers `.html`)** :
    - Restent à la racine du projet.
    - Doivent charger les ressources en utilisant des chemins relatifs vers les bons sous-dossiers (`css/style.css`, `js/app.js`).

2. **Styles (fichiers `.css`)** :
    - Centralisés dans le dossier `css/`.
    - Évite les styles _inline_ directement dans le HTML pour une meilleure maintenabilité.

3. **Scripts (fichiers `.js`)** :
    - **`websocket.js`** : Ne s'occupe _que_ de la connexion réseau. Il établit la connexion au serveur WebSocket, s'abonne aux événements, et expose les données reçues.
    - **`app.js`** : Interagit avec l'interface HTML de l'utilisateur. Appelle ou écoute les changements venant de `websocket.js` pour rafraîchir l'affichage (mise à jour des températures, par exemple).

4. **Serveur** :
    - Actuellement le projet utilise `http-server` (via le script `"dev"` du `package.json`). C'est parfait pour servir les fichiers statiques (HTML/CSS/JS).
    - Toutefois, un WebSocket requiert un service persistant qui écoute/émet les requêtes. Placer ce futur code Node.js dans un dossier `server/` permettra d'être bien isolé du front-end.
