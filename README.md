# 🗣️ SoussTalk – Application de messagerie intelligente et sécurisée

**SoussTalk** est une application de chat en temps réel, collaborative, intelligente et sécurisée, conçue pour connecter les utilisateurs de manière fluide tout en assurant leur sécurité émotionnelle et numérique. Ce projet est développé par une équipe d'étudiants de l’**ENSIASD** dans le cadre d’un travail collaboratif.

---

## 🚀 Fonctionnalités principales

- 🔒 **Messagerie en temps réel** (Socket.IO)
- 🎭 **Détection des émotions** à partir des messages textes
- ⚠️ **Détection automatique des messages frauduleux (scam/phishing)**
- 👥 **Discussions privées et de groupe**
- 🖥️ **Interface moderne** développée avec React Native (Expo)
- 📦 **Base de données collaborative** Supabase (PostgreSQL)
- 🔔 **Système de notifications en temps réel**
- 🧑‍🤝‍🧑 Conçu pour le travail en équipe

---

## 🧠 Intelligence intégrée

SoussTalk intègre des algorithmes d’analyse du langage naturel (NLP) pour :

- Identifier l’**humeur générale** d’une conversation (joie, tristesse, colère, etc.)
- Détecter des messages suspects ou contenant des **liens potentiellement dangereux**

Cela permet de **prévenir les arnaques**, améliorer **l’expérience utilisateur** et créer un **espace de discussion sain et respectueux**.

---

## 🧰 Stack technologique

| Technologie            | Usage                              |
|------------------------|------------------------------------|
| React Native (Expo)    | Front-end mobile                   |
| Node.js + Express      | Back-end                           |
| Supabase (PostgreSQL)  | Base de données collaborative      |
| Socket.IO              | Communication en temps réel        |
| NLP / IA (TensorFlow.js ou API Python) | Analyse d’émotions et détection de scam |

---

## 👨‍💻 Équipe de développement

- **Badie Bahida**
- **Khawla**
- **Said**
- **Yousf**
- **Doaa**

> Étudiants à l’**École Nationale Supérieure de l’Intelligence Artificielle et des Sciences des Données – ENSIASD**

---

## 🌍 Pourquoi "SoussTalk" ?

Le nom **SoussTalk** rend hommage à la région **Souss Massa**, d’où sont originaires certains membres de l’équipe. Il symbolise une volonté de **connecter les individus avec intelligence et authenticité**, tout en valorisant nos racines culturelles.

---

## 📦 Installation (exemple simplifié)

```bash
# Clone le dépôt
git clone https://github.com/badie16/SoussTalk.git
# Installe les dépendances du serveur
cd server
npm install

# Lance le serveur
npm start

# Installe les dépendances du client
cd ../client
npm install

# Lance le client Expo
npx expo start
