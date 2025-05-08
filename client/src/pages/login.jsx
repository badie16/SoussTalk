import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";
import Loading from "../components/Loading";

export default function Login() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
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

		if (loading) return; // éviter les doubles clics rapides

		setLoading(true);
		setError("");

		try {
			const result = await login(formData);

			if (result.success) {
				navigate("/chat");
			} else {
				setError(
					result.message || "Une erreur est survenue lors de la connexion."
				);
			}
		} catch (err) {
			setError(
				err.response?.data?.message || "Connexion échouée. Veuillez réessayer."
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
			<div className="hidden md:flex md:w-1/3 lg:w-3/6 flex-col p-10 text-white">
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
					© {new Date().getFullYear()} SoussTalk. Développé par les étudiants de l'ENSIASD
				</div>
			</div>

			{/* Right side with login form */}
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
						<h2 className="text-3xl font-bold text-gray-800">Bienvenue !</h2>
						<p className="text-gray-600 mt-2">
							Connectez-vous pour continuer à SoussTalk.
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

					<form className="space-y-6" onSubmit={handleSubmit}>
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
							<div className="flex justify-between items-center mb-1">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Mot de passe
								</label>
								<a
									href="#"
									className="text-sm text-green-600 hover:text-green-500"
								>
									Mot de passe oublié?
								</a>
							</div>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
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

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
									checked={rememberMe}
									onChange={() => setRememberMe(!rememberMe)}
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-sm text-gray-700"
								>
									Se souvenir de moi
								</label>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
							>
								{loading ? "Connexion en cours..." : "Se connecter"}
							</button>
						</div>
					</form>
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Vous n'avez pas de compte?{" "}
							<Link
								to="/register"
								className="font-medium text-green-600 hover:text-green-500"
							>
								S'inscrire
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
