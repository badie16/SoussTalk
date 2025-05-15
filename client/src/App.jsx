import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./pages/chat";
import NotFound from "./pages/not-found";
import ConnectionError from "./pages/connection-error";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile";
export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/profile" element={<Profile />} />
			<Route
				path="/chat"
				element={
					<ProtectedRoute>
						<Chat />
					</ProtectedRoute>
				}
			/>
			<Route path="/connection-error" element={<ConnectionError />} />
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}
