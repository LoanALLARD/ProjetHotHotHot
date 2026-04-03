# Architecture du Projet Hot Hot Hot

Ce document décrit l'organisation des fichiers et dossiers du projet. La structure est pensée pour séparer proprement l'interface client (HTML/CSS/JS), les vues, et la logique serveur (WebSockets).

## Structure globale

```text
ProjetHotHotHot/
├── public/                # Tout le code Front-end (affiché par le navigateur)
│   ├── index.html         # Point d'entrée principal du site
│   ├── views/             # Dossier contenant toutes tes pages HTML secondaires
│   │   ├── about.html
│   │   ├── documentation.html
│   │   └── logout.html
│   ├── css/               # Feuilles de style
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/                # Scripts JavaScript côté client
│   │   ├── app.js         # Logique d'interface (Manipulation DOM)
│   │   └── websocket.js   # Logique réseau uniquement (connexion WebSocket)
│   └── assets/            # Fichiers statiques (images, polices, etc.)
│
├── server/                # Code Back-end / Serveur
│   └── server.js          # Serveur (ex: Node.js) gérant les WebSockets
│
├── doc/                   # Documentation technique du projet (ce dossier)
│   └── architecture.md    # Document de présentation de l'architecture (ce fichier)
│
├── package.json           # Fichier de configuration autonome (dépendances et scripts)
└── README.md              # Documentation à la racine du dépôt git
```

## Conventions de nommage et de séparation

1. **Le dossier `public/` (Front-end)** :
   - Contient l'intégralité de ce qui est distribué par le serveur web. Il agit comme la "racine" de ton site web. L'avantage est qu'il sépare complètement les fichiers de configuration du projet et le code du serveur du code visible par l'utilisateur.

2. **Les Vues (`public/views/`)** :
   - L'`index.html` vit à la racine de `public/` pour un accès direct.
   - Les autres pages (connexion, à propos, documentation) sont rangées dans `views/` pour garder un répertoire principal propre. _Attention à bien adapter les chemins relatifs dans tes balises HTML (ex: `<script src="../js/app.js"></script>`)._

3. **La Logique UI et Réseau (`js/`)** :
   - **`websocket.js`** : Maintient la connexion constante (WebSocket) et déclenche des événements métiers.
   - **`app.js`** : Actualise ce qui est affiché à l'écran en fonction des événements venant du WebSocket.

4. **Scripts de Lancement (`package.json`)** :
   - Le serveur statique en mode développement pointera directement sur le sous-dossier `public/` pour l'héberger (ex : `npx http-server public/ ...`).
