# 💖 ThaiFlash - Apprentissage du Thaïlandais Oral en Couple

**ThaiFlash** est une application web interactive full-stack conçue pour aider les couples franco-thaïlandais à apprendre et mémoriser le thaïlandais parlé. Elle se concentre exclusivement sur l'apprentissage **oral**, l'écoute, les tons et les expressions affectueuses de la complicité amoureuse.

---

## 🚀 Fonctionnalités Clés

*   **🎙️ Double Moteur Audio Intégré** : Utilise la synthèse vocale locale ou bascule automatiquement vers notre proxy de flux HD Google TTS pour contourner les restrictions d'iframe et de navigateurs (notamment sur iPhone/iOS).
*   **📖 Lexique & Cartes Mémoire Romantiques** : Plus de 35 expressions réelles classées en 6 thèmes (mots doux, déclarations, flirt, vie quotidienne, soutien et réconciliation) avec indication claire de qui parle (Lui / Elle).
*   **🎭 Simulateur de Dialogues Réels** : Des scénarios interactifs de jeux de rôle pour vous exercer à répondre correctement à votre compagne.
*   **🧩 Jeu d'Association** : Associez les expressions orales (phonétiques) à leur traduction française.
*   **📊 Suivi de Complicité** : Graphique de mémorisation, historique et suivi des jours d'apprentissage consécutifs (streak).

---

## 🛠️ Installation et Lancement Local

### Prérequis
*   [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)
*   NPM (installé automatiquement avec Node.js)

### Étapes
1.  **Clonez le dépôt ou téléchargez les fichiers** dans votre dossier de travail.
2.  **Installez les dépendances** :
    ```bash
    npm install
    ```
3.  **Lancez le serveur de développement** :
    ```bash
    npm run dev
    ```
4.  Ouvrez votre navigateur à l'adresse : [http://localhost:3000](http://localhost:3000)

---

## 🐙 Comment publier sur GitHub et activer l'Intégration Continue (CI)

Pour sauvegarder votre code de manière sécurisée sur GitHub et vérifier automatiquement la qualité de votre code à chaque modification :

1.  **Créez un nouveau dépôt vide** sur votre compte [GitHub](https://github.com/) (nommez-le `ThaiFlash`).
2.  **Initialisez Git** dans votre dossier local et associez-le à GitHub :
    ```bash
    git init
    git add .
    git commit -m "Initial commit : Lancement de ThaiFlash"
    git branch -M main
    git remote add origin https://github.com/VOTRE_PSEUDO/ThaiFlash.git
    git push -u origin main
    ```
3.  **Intégration Continue (CI) Active** : Un workflow GitHub Actions est configuré dans `.github/workflows/deploy.yml`. À chaque fois que vous ferez un `git push`, GitHub exécutera automatiquement les tests de linter et de compilation pour s'assurer que l'application est toujours stable et prête à être déployée.

---

## ☁️ Déploiement Automatique de l'application (Hosting)

Comme l'application est **Full-Stack** (elle possède un serveur Express pour gérer l'API de streaming de voix thaïlandaise `/api/tts` sans blocage CORS), elle doit être hébergée sur une plateforme supportant Node.js ou Docker.

Voici les 3 méthodes recommandées et entièrement gratuites ou peu coûteuses :

### Option 1 : Déploiement en 1 clic sur Render (Recommandé)
1.  Créez un compte gratuit sur [Render](https://render.com/).
2.  Cliquez sur **New +** puis choisissez **Web Service**.
3.  Connectez votre compte GitHub et sélectionnez votre dépôt `ThaiFlash`.
4.  Configurez les paramètres suivants :
    *   **Runtime** : `Node`
    *   **Build Command** : `npm install && npm run build`
    *   **Start Command** : `tsx server.ts` (ou utilisez Docker grâce au `Dockerfile` inclus !)
5.  Render déploiera automatiquement votre application à chaque fois que vous pousserez des modifications sur GitHub (`git push`).

### Option 2 : Déploiement via Docker (Le plus robuste)
Un `Dockerfile` de production optimisé est fourni à la racine du projet. Vous pouvez déployer ce conteneur instantanément sur des services comme **Render**, **Koyeb**, **Railway** ou **Google Cloud Run** en choisissant simplement l'option de build "Docker".

---

## 📂 Structure du Projet

*   `/server.ts` : Serveur Express qui gère la distribution des pages et l'API sécurisée de synthèse vocale.
*   `/src/utils/audio.ts` : Gestionnaire audio intelligent avec double moteur.
*   `/src/data/thaiVocab.ts` : Notre dictionnaire et vocabulaire oral spécial couple.
*   `/src/data/thaiGuide.ts` : Guide interactif des pronoms et des 5 tons du thaïlandais.
*   `/.github/workflows/deploy.yml` : Automatisation des tests et validation GitHub.
