# E-POINTY Backend (AdonisJS)

Ce dossier contient le code source de l'API REST qui propulse l'application E-POINTY.
Il est conçu pour fonctionner avec **AdonisJS v6**.

## Installation

1. Initialiser un projet Adonis : `npm init adonisjs@latest epointy-api`
2. Copier les fichiers de ce dossier vers les emplacements correspondants.
3. Configurer la base de données dans `.env`.
4. Lancer les migrations : `node ace migration:run`
5. Démarrer le serveur : `npm run dev`

## Endpoints Principaux

- `POST /api/login` : Authentification utilisateur.
- `GET /api/me` : Profil utilisateur courant.
- `GET /api/students/:uuid` : Récupération info étudiant via QR Code.
- `POST /api/attendances` : Validation d'une présence.
- `GET /api/stats/direction` : Données pour le dashboard direction.
