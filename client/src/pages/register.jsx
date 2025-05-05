"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone_number: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			setLoading(false);
			return;
		}

		try {
			const API_URL = import.meta.env.VITE_API_URL;
			const response = await axios.post(`${API_URL}/auth/register`, {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				phone_number: formData.phone_number || null,
			});

			// Store token in localStorage
			localStorage.setItem("token", response.data.token);

			// Store user data
			localStorage.setItem("user", JSON.stringify(response.data.user));

			// Redirect to chat
			navigate("/chat");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Inscription échouée. Veuillez réessayer."
			);
		} finally {
			setLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-green-400 to-green-600">
			{/* Left sidebar with illustration */}
			<div className="hidden md:flex md:w-1/3 lg:w-2/5 flex-col p-10 text-white">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">SoussTalk</h1>
					<p className="text-sm opacity-80">
						Messagerie intelligente et sécurisée
					</p>
				</div>

				<div className="flex-grow flex items-center justify-center">
					<img
						src="/images/chat-illustration.png"
						alt="SoussTalk Illustration"
						className="max-w-full h-auto"
					/>
				</div>

				<div className="mt-auto text-sm opacity-70">
					© 2023 SoussTalk. Développé par les étudiants de l'ENSIASD
				</div>
			</div>

			{/* Right side with registration form */}
			<div className="w-full md:w-2/3 lg:w-3/5 bg-white rounded-l-3xl shadow-xl flex items-center justify-center p-6  my-5">
				<div className="w-full max-w-md">
					{/* Mobile logo - only visible on small screens */}
					<div className="md:hidden text-center mb-8">
						<h1 className="text-3xl font-bold text-green-600">SoussTalk</h1>
						<p className="text-sm text-gray-500">
							Messagerie intelligente et sécurisée
						</p>
					</div>

					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold text-gray-800">
							Créer un compte
						</h2>
						<p className="text-gray-600 mt-2">
							Rejoignez SoussTalk dès aujourd'hui
						</p>
					</div>

					{error && (
						<div
							className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
							role="alert"
						>
							<span className="block sm:inline">{error}</span>
						</div>
					)}

					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Nom d'utilisateur
							</label>
							<input
								id="username"
								name="username"
								type="text"
								required
								className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
								placeholder="Votre nom d'utilisateur"
								value={formData.username}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
								placeholder="votre@email.com"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="phone_number"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Numéro de téléphone (optionnel)
							</label>
							<input
								id="phone_number"
								name="phone_number"
								type="tel"
								className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
								placeholder="+212 6XX XXXXXX"
								value={formData.phone_number}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Mot de passe
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									required
									className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
									placeholder="••••••••"
									value={formData.password}
									onChange={handleChange}
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={togglePasswordVisibility}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Confirmer le mot de passe
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									required
									className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
									placeholder="••••••••"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="pt-2">
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
							>
								{loading ? "Création en cours..." : "Créer un compte"}
							</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Vous avez déjà un compte?{" "}
							<Link
								to="/login"
								className="font-medium text-green-600 hover:text-green-500"
							>
								Se connecter
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
