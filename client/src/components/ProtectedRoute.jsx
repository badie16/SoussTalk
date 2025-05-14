import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
	// Vérifier si l'utilisateur est authentifié directement via localStorage
	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");

	// Rediriger vers login si non authentifié
	if (!token || !user) {
		return <Navigate to="/login" replace />;
	}

	return children;
}
