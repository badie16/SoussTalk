# 🗣️ SoussTalk – Application de Messagerie Intelligente, Sécurisée et Collaborative

**SoussTalk** est une plateforme de messagerie en temps réel, dotée de fonctionnalités intelligentes telles que la détection des émotions et des arnaques. Ce projet est développé par une équipe d'étudiants de l'**ENSIASD**, avec un accent particulier sur la sécurité, la collaboration et l'expérience utilisateur.

---

## 🌟 Fonctionnalités Clés

- 🔐 **Authentification sécurisée** (JWT + Bcrypt)
- 🗣️ **Chat en temps réel** (Socket.IO)
- 🧠 **Détection d’émotions et d’arnaques** dans les messages
- 🖼️ **Envoi et stockage de fichiers** (images, documents) via **Supabase Storage**
- 🔔 **Notifications instantanées**
- 📱 **Interface responsive**, moderne et accessible

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

### Outils de Développement

- **Git & GitHub** – Versioning et collaboration
- **.env** – Gestion sécurisée des clés/API

---
## 📁 Structure du Projet SoussTalk

### Backend (Node.js/Express)

```plaintext
src/
├── controllers/         # Contient les contrôleurs qui gèrent la logique métier (traitement des requêtes, interaction avec la base de données).
├── middleware/      # 	Modules intermédiaires pour l'authentification (JWT), la validation des données, ou la détection d'arnaques avant d'atteindre les contrôleurs.
├── routes/         # 	Définit les endpoints de l'API (ex: /auth, /messages) et les associe aux contrôleurs.
├── services/           # 	Logique complexe ou accès aux données (ex: service de détection d'émotions avec IA)
├── index.js/           #  Point d'entrée du serveur : configure Express, les middlewares, et lance le serveur.
├── package.json/           #  Configuration du projet
```
### Frontend (React)

```plaintext
src/
├── assets/          # Ressources statiques (images, polices, icônes).
├── components/      # Composants React réutilisables (ex: Message.jsx, Navbar.jsx).
├── context/         # Gestion d'état global avec React Context (ex: AuthContext.js pour l'utilisateur connecté).
├── hooks/           # Hooks personnalisés (ex: useSocket.js pour la gestion des WebSockets).
└── pages/           # Composants représentant des pages (ex: LoginPage.jsx, ChatPage.jsx).
├── package.json/    # Configuration du projet
├── App.js/          # Composant racine qui définit les routes et la structure de base.
```
## 🧑‍💻 Équipe de Développement

> Étudiants de l'**École Nationale Supérieure de l'Intelligence Artificielle et des Sciences des Données – ENSIASD**

- Badie
- Khaoula
- Said
- Youssef
- Douae

---

## 🛠️ Installation Locale

### 1. Cloner le projet

```bash
git clone https://github.com/badie16/SoussTalk.git
cd sousstalk
```

### 2. Installer les dépendances pour le front-end

```bash
cd client
npm install
```

### 3. Installer les dépendances pour le back-end

```bash
cd ../server
npm install
```

### 4. Lancer le serveur de développement

Pour le front-end

```bash
cd client
npm run dev
```

Pour le back-end

```bash
cd server
npm run dev
```
##  📄 Licence
Ce projet est sous licence MIT. Consulte le fichier LICENSE pour plus d’informations.

## 📞 Contact
Si vous avez des questions, des suggestions ou des commentaires, n’hésitez pas à nous contacter à notre email.
