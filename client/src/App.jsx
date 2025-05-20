import { Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./pages/chat";
import NotFound from "./pages/not-found";
import ConnectionError from "./pages/connection-error";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile";
import Stories from "./pages/story";
import Contacts from "./pages/contact";
import AddStory from "./components/addStory";
import FindFriends from "./pages/find-friends";
import { ThemeProvider } from "./context/ThemeContext";
import StoryViewer from "./pages/storyViewer";
export default function App() {
	const location = useLocation();
	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/register";

	// Wrapper conditionnel avec ThemeProvider
	const renderWithTheme = (component) => {
		return isAuthPage ? component : <ThemeProvider>{component}</ThemeProvider>;
	};

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route
				path="/profile"
				element={renderWithTheme(
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				)}
			/>
			<Route
				path="/contacts"
				element={renderWithTheme(
					<ProtectedRoute>
						<Contacts />
					</ProtectedRoute>
				)}
			/>
			<Route
				path="/chat"
				element={renderWithTheme(
					<ProtectedRoute>
						<Chat />
					</ProtectedRoute>
				)}
			/>
			<Route
				path="/story"
				element={renderWithTheme(
					<ProtectedRoute>
						<Stories />
					</ProtectedRoute>
				)}
			/>
			<Route
				path="/storyViewer"
				element={renderWithTheme(
					<ProtectedRoute>
						<StoryViewer />
					</ProtectedRoute>
				)}
			/>			
			<Route
				path="/find-friends"
				element={renderWithTheme(
					<ProtectedRoute>
						<FindFriends />
					</ProtectedRoute>
				)}
			/>
			<Route
				path="/connection-error"
				element={renderWithTheme(<ConnectionError />)}
			/>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="*" element={renderWithTheme(<NotFound />)} />
		</Routes>
	);
}
