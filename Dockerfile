# Étape de construction (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation de toutes les dépendances
RUN npm ci

# Copie de l'intégralité du code source
COPY . .

# Construction de l'application statique Vite
RUN npm run build

# Étape finale de production (Production)
FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de package et installation des dépendances de production uniquement
COPY package*.json ./
RUN npm ci --only=production

# Installation globale de tsx pour exécuter directement le fichier TypeScript du serveur
RUN npm install -g tsx

# Copie des fichiers nécessaires compilés et sources du serveur
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/types ./src/types

# Exposition du port d'écoute standard
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande de lancement de l'application full-stack
CMD ["tsx", "server.ts"]
