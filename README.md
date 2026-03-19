# ProjetHotHotHot
Projet Hot Hot Hot

## Mise en place HTTPS

> Se rendre dans ce site https://web.dev/articles/how-to-use-local-https?hl=fr

1) **Installer ``mkcert`` (en fonction votre système d'exploitation)**

```bash
    # Pour mac
    brew install mkcert
    brew install nss # if you use Firefox
```

2) **Ajoutez mkcert à vos autorités de certification racine locales**

```bash
  mkcert -install
```

3) **Générez un certificat pour votre site, signé par mkcert.**

Pour un nom de domaine personnalisé

```bash
  mkcert mysite.example localhost 127.0.0.1
```

La commande juste au-dessus a deux effets:

- Génère un certificat pour le nom d'hôte que vous avez spécifié.
- Permet à mkcert de signer le certificat.

Votre certificat est maintenant prêt et signé par une autorité de certification approuvée localement par votre navigateur.

4) **Créer un fichier package.json**

```bash
    {
        "scripts": {
            "dev": "npx http-server -S -C {FILE-PATH-WITHOUT-KEY}.pem -K {FILE-PATH-WITH-KEY}-key.pem"
        }
    }
```
et tapez la commande suivante pour initialiser le fichier package.json

```bash
    npm init -y
```

## Lancer le serveur HTTPS

```bash
    npm run dev
```
