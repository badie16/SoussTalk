# 🗣️ SoussTalk – Application de messagerie intelligente, sécurisée et collaborative

**SoussTalk** est une plateforme de messagerie en temps réel, dotée de fonctionnalités intelligentes comme la détection d'émotions et de scams. Ce projet est développé par une équipe d'étudiants de l'**ENSIASD**, avec une attention particulière portée à la sécurité, la collaboration et l'expérience utilisateur.

---

## 🌟 Fonctionnalités clés

- 🔐 Authentification sécurisée (JWT + Bcrypt)
- 🗣️ Chat en temps réel (Socket.IO)
- 🧠 Détection d’émotions et d’arnaques dans les messages
- 🖼️ Envoi et stockage de fichiers (images, documents) via Supabase Storage
- 🔔 Notifications instantanées
- 📱 Interface responsive, moderne, et accessible

---

## ⚙️ Stack Technique

### Front-End

- **React** (Vite)
- **React Router** (navigation)
- **Tailwind CSS** (design responsive)
- **Axios** (requêtes HTTP)
- **Socket.IO Client** (communication temps réel)

### Back-End

- **Node.js + Express** (API REST)
- **Socket.IO** (WebSocket)
- **JWT** (authentification par token)
- **Bcrypt** (hash de mots de passe)

### Base de Données

- **Supabase (PostgreSQL)** – Base de données relationnelle
- **Supabase Storage** – Stockage de fichiers

### Déploiement

- **Vercel** – Front-end
- **Render** ou **Railway** – Back-end (API + WebSocket)

### Sécurité

- **Helmet** – Protection des en-têtes HTTP
- **CORS** – Contrôle des accès Cross-Origin
- **Rate Limiting** – Limitation de requêtes pour éviter les abus
- **HTTPS** – Communication chiffrée

### Outils de Dev

- **Git & GitHub** – Versioning et collaboration
- **.env** – Gestion sécurisée des clés/API

---

## 🧑‍💻 Équipe de développement

> Étudiants de l'**École Nationale Supérieure de l'Intelligence Artificielle et des Sciences des Données – ENSIASD**

- Badie Bahida
- Khawla
- Said
- Yousf
- Doaa

---

## 🛠️ Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-utilisateur/sousstalk.git
cd sousstalk
