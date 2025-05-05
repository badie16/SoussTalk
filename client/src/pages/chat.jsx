"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Chat() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const API_URL = import.meta.env.VITE_API_URL;
				const token = localStorage.getItem("token");

				if (!token) {
					navigate("/login");
					return;
				}

				const response = await axios.get(`${API_URL}/auth/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				setUser(response.data.user);
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				navigate("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [navigate]);

	const handleLogout = async () => {
		try {
			const API_URL = import.meta.env.VITE_API_URL;
			const token = localStorage.getItem("token");

			if (token) {
				await axios.post(
					`${API_URL}/auth/logout`,
					{},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			navigate("/login");
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-2xl">Chargement...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-bold text-green-600">SoussTalk</h1>
						</div>
						<div className="flex items-center">
							<span className="mr-4">
								Bienvenue, {user?.username || "Utilisateur"}
							</span>
							<button
								onClick={handleLogout}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
							>
								Déconnexion
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
						<h2 className="text-2xl font-bold mb-4">Chat</h2>
						<p>
							Bienvenue sur SoussTalk. Cette page sera bientôt remplacée par
							l'interface de chat.
						</p>
						<div className="mt-4 p-4 bg-white rounded shadow">
							<h3 className="text-lg font-medium">Votre Profil</h3>
							<div className="mt-2">
								<p>
									<strong>ID:</strong> {user?.id}
								</p>
								<p>
									<strong>Nom d'utilisateur:</strong> {user?.username}
								</p>
								<p>
									<strong>Email:</strong> {user?.email}
								</p>
								{user?.phone_number && (
									<p>
										<strong>Téléphone:</strong> {user?.phone_number}
									</p>
								)}
								{user?.bio && (
									<p>
										<strong>Bio:</strong> {user?.bio}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
