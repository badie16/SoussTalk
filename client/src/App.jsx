import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { useEffect } from "react";

// Composant pour vérifier l'authentification
function AuthCheck({ children }) {
  const location = useLocation();
  
  useEffect(() => {
    // Vérifier l'authentification à chaque changement de route
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [location]);

  return children;
}

// Route protégée
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthCheck>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes protégées */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Redirection par défaut */}
        <Route path="/" element={
          localStorage.getItem("token") 
            ? <Navigate to="/chat" replace /> 
            : <Navigate to="/login" replace />
        } />
      </Routes>
    </AuthCheck>
  );
}
