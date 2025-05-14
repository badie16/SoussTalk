# 🗣️ SoussTalk – Smart, Secure & Collaborative Messaging App  

**SoussTalk** is a real-time messaging platform with intelligent features like emotion and scam detection. This project is developed by a team of students from **ENSIASD**, with a strong focus on security, collaboration, and user experience.  VS

---  

## 🌟 Key Features  

- 🔐 **Secure authentication** (JWT + Bcrypt)  
- 🗣️ **Real-time chat** (Socket.IO)  
- 🧠 **Emotion & scam detection** in messages  
- 🖼️ **File upload & storage** (images, documents) via **Supabase Storage**  
- 🔔 **Instant notifications**  
- 📱 **Responsive, modern & accessible UI**  

---  

## ⚙️ Tech Stack  

### Front-End  
- **React** (Vite)  
- **React Router** (navigation)  
- **Tailwind CSS** (responsive design)  
- **Axios** (HTTP requests)  
- **Socket.IO Client** (real-time communication)  

### Back-End  
- **Node.js + Express** (REST API)  
- **Socket.IO** (WebSocket)  
- **JWT** (token authentication)  
- **Bcrypt** (password hashing)  

### Database  
- **Supabase (PostgreSQL)** – Relational database  
- **Supabase Storage** – File storage  

### Deployment  
- **Vercel** – Front-end  
- **Render** or **Railway** – Back-end (API + WebSocket)  

### Security  
- **Helmet** – HTTP headers protection  
- **CORS** – Cross-Origin Access Control  
- **Rate Limiting** – Request throttling to prevent abuse  
- **HTTPS** – Encrypted communication  

### Development Tools  
- **Git & GitHub** – Version control & collaboration  
- **.env** – Secure API key management  

---  

## 📁 Project Structure  

### Backend (Node.js/Express)  
```
src/  
├── controllers/     # Business logic (request handling, DB interaction)  
├── middleware/      # Authentication (JWT), data validation  
├── routes/          # API endpoints (e.g., /auth, /messages)  
├── services/        # Complex logic (e.g., AI-based emotion detection)  
├── index.js/        # Server entry (Express setup, middleware, server launch)  
├── package.json/    # Project configuration  
```

### Frontend (React)  
```
src/  
├── assets/          # Static resources (images, fonts, icons)  
├── components/      # Reusable React components (e.g., Message.jsx, Navbar.jsx)  
├── context/         # Global state (e.g., AuthContext.js for logged-in user)  
├── hooks/           # Custom hooks (e.g., useSocket.js for WebSocket handling)  
└── pages/           # Page components (e.g., LoginPage.jsx, ChatPage.jsx)  
├── package.json/    # Project configuration  
├── App.js/          # Root component (routes & base structure)  
```  

## 🧑‍💻 Development Team  
> Students from **École Nationale Supérieure de l'Intelligence Artificielle et des Sciences des Données – ENSIASD**  

- Badie  
- Khaoula  
- Said  
- Youssef  
- Douae  

---  

## 🛠️ Local Setup  

### 1. Clone the project  
```bash  
git clone https://github.com/badie16/SoussTalk.git  
cd sousstalk  
```  

### 2. Install front-end dependencies  
```bash  
cd client  
npm install  
```  

### 3. Install back-end dependencies  
```bash  
cd ../server  
npm install  
```  

### 4. Run the development server  

Front-end:  
```bash  
cd client  
npm run dev  
```  

Back-end:  
```bash  
cd server  
npm run dev  
```  

## 📄 License  
This project is under the MIT License. See the LICENSE file for details.  

## 📞 Contact  
For questions, suggestions, or feedback, feel free to reach out via email.  
