"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Eye,
	EyeOff,
	Mail,
	CheckCircle,
	ArrowRight,
	ArrowLeft,
} from "lucide-react";
import { signup } from "../services/authService";

export default function Signup() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		profilePicture: null,
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		phone: "",
		bio: "",
		gender: "male",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const [previewImage, setPreviewImage] = useState(null);
	const [registrationComplete, setRegistrationComplete] = useState(false);

	// Vérifier si l'utilisateur est déjà connecté
	useEffect(() => {
		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (token && user) {
			navigate("/chat");
		}
	}, [navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prevState) => ({
				...prevState,
				profilePicture: file,
			}));

			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result);
			};
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(null);
		}
	};

	const nextStep = () => {
		if (validateStep()) {
			setStep(step + 1);
			setError("");
		}
	};

	const prevStep = () => {
		setStep(step - 1);
		setError("");
	};

	const validateStep = () => {
		setError("");
		if (step === 1) {
			if (!formData.first_name.trim()) {
				setError("Le prénom est requis");
				return false;
			}
			if (!formData.last_name.trim()) {
				setError("Le nom est requis");
				return false;
			}
			if (!formData.username.trim()) {
				setError("Le nom d'utilisateur est requis");
				return false;
			}
			return true;
		}

		if (step === 2) {
			if (!formData.email.trim()) {
				setError("L'email est requis");
				return false;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				setError("Veuillez entrer une adresse email valide");
				return false;
			}

			if (!formData.gender) {
				setError("Veuillez sélectionner votre genre");
				return false;
			}
			return true;
		}

		if (step === 3) {
			if (!formData.password) {
				setError("Le mot de passe est requis");
				return false;
			}
			if (formData.password.length < 8) {
				setError("Le mot de passe doit contenir au moins 8 caractères");
				return false;
			}
			if (formData.password !== formData.confirmPassword) {
				setError("Les mots de passe ne correspondent pas");
				return false;
			}
			return true;
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const formDataToSend = new FormData();
			for (const key in formData) {
				formDataToSend.append(key, formData[key]);
			}

			const result = await signup(formDataToSend);
			if (result.success) {
				setRegistrationComplete(true);
			} else {
				setError(result.message);
			}
		} catch (err) {
			console.error(err);
			setError("Inscription échouée. Veuillez réessayer.");
		} finally {
			setLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	// Le reste du composant reste inchangé
	return (
		<div className="flex min-h-screen bg-gradient-to-br from-green-400 to-green-600">
			{/* Le reste du code reste inchangé */}
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
					© {new Date().getFullYear()} SoussTalk. Développé par les étudiants de
					l'ENSIASD
				</div>
			</div>
			{registrationComplete ? (
				<div className="w-full md:w-2/3 lg:w-3/5 bg-white rounded-l-3xl shadow-xl flex items-center justify-center p-6 my-5">
					<div className="w-full max-w-md text-center">
						<div className="flex flex-col items-center justify-center space-y-4">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
								<Mail className="h-8 w-8 text-green-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-800">
								Vérifiez votre email
							</h2>
							<p className="text-gray-600">
								Un email de confirmation a été envoyé à{" "}
								<span className="font-medium">{formData.email}</span>
							</p>
							<div className="bg-gray-50 p-4 rounded-lg w-full">
								<p className="text-sm text-gray-600">
									Veuillez vérifier votre boîte de réception et cliquer sur le
									lien de confirmation pour activer votre compte.
								</p>
								<p className="text-sm text-gray-600 mt-2">
									Si vous ne trouvez pas l'email, vérifiez votre dossier spam.
								</p>
							</div>
							<div className="flex flex-col space-y-3 w-full mt-4">
								<button
									onClick={() => navigate("/login")}
									className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
								>
									Aller à la page de connexion
								</button>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="w-full md:w-2/3 lg:w-3/5 bg-white rounded-l-3xl shadow-xl flex items-center justify-center p-6 my-5">
					<div className="w-full max-w-md">
						{/* Mobile logo - only visible on small screens */}
						<div className="md:hidden text-center mb-8">
							<h1 className="text-3xl font-bold text-green-600">SoussTalk</h1>
							<p className="text-sm text-gray-500">
								Messagerie intelligente et sécurisée
							</p>
						</div>

						<div className="text-center mb-10">
							<h2 className="text-3xl font-bold text-gray-800">Inscription</h2>
							<p className="text-gray-600 mt-2">
								Rejoignez la communauté SoussTalk.
							</p>
							<div className="flex justify-center mt-4">
								<div className="flex space-x-2">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className={`h-2 w-2 rounded-full ${
												i <= step ? "bg-green-500" : "bg-gray-300"
											}`}
										/>
									))}
								</div>
							</div>
						</div>

						{error && (
							<div
								className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
								role="alert"
							>
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit}>
							{/* Le reste du formulaire reste inchangé */}
							{/* Step 1: Basic Info */}
							{step === 1 && (
								<div className="space-y-6">
									<div>
										<label
											htmlFor="first_name"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Prénom
										</label>
										<input
											id="first_name"
											name="first_name"
											type="text"
											required
											className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
											placeholder="Votre prénom"
											value={formData.first_name}
											onChange={handleChange}
										/>
									</div>

									<div>
										<label
											htmlFor="last_name"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Nom
										</label>
										<input
											id="last_name"
											name="last_name"
											type="text"
											required
											className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
											placeholder="Votre nom"
											value={formData.last_name}
											onChange={handleChange}
										/>
									</div>

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
											placeholder="Nom d'utilisateur unique"
											value={formData.username}
											onChange={handleChange}
										/>
									</div>

									<button
										type="button"
										onClick={nextStep}
										className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
									>
										Suivant <ArrowRight className="ml-2 h-4 w-4" />
									</button>
								</div>
							)}

							{/* Step 2: Contact Info */}
							{step === 2 && (
								<div className="space-y-6">
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
											required
											className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
											placeholder="votre@email.com"
											value={formData.email}
											onChange={handleChange}
										/>
									</div>

									<div>
										<label
											htmlFor="phone"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Numéro de téléphone (optionnel)
										</label>
										<input
											id="phone"
											name="phone"
											type="tel"
											className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
											placeholder="+212 6 00 00 00 00"
											value={formData.phone}
											onChange={handleChange}
										/>
									</div>

									<div>
										<label
											htmlFor="bio"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Bio (optionnel)
										</label>
										<textarea
											id="bio"
											name="bio"
											rows="3"
											className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
											placeholder="Parlez-nous un peu de vous..."
											value={formData.bio}
											onChange={handleChange}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Genre
										</label>
										<div className="flex space-x-4">
											<label className="inline-flex items-center">
												<input
													type="radio"
													name="gender"
													value="male"
													checked={formData.gender === "male"}
													onChange={handleChange}
													className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
												/>
												<span className="ml-2 text-gray-700">Homme</span>
											</label>
											<label className="inline-flex items-center">
												<input
													type="radio"
													name="gender"
													value="female"
													checked={formData.gender === "female"}
													onChange={handleChange}
													className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
												/>
												<span className="ml-2 text-gray-700">Femme</span>
											</label>
										</div>
									</div>

									<div className="flex space-x-4">
										<button
											type="button"
											onClick={prevStep}
											className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
										>
											<ArrowLeft className="mr-2 h-4 w-4" /> Précédent
										</button>
										<button
											type="button"
											onClick={nextStep}
											className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
										>
											Suivant <ArrowRight className="ml-2 h-4 w-4" />
										</button>
									</div>
								</div>
							)}

							{/* Step 3: Password and Avatar */}
							{step === 3 && (
								<div className="space-y-6">
									{/* Photo de profil déplacée à l'étape 3 */}
									<div className="flex flex-col items-center">
										<label className="block text-sm font-medium text-gray-700 mb-3">
											Photo de profil (optionnel)
										</label>

										{/* Conteneur de l'aperçu */}
										<div className="relative group">
											<input
												id="profilePicture"
												name="profilePicture"
												type="file"
												accept="image/*"
												onChange={handleFileChange}
												className="hidden"
											/>

											{/* Aperçu circulaire */}
											<label
												htmlFor="profilePicture"
												className={`flex items-center justify-center cursor-pointer ${
													previewImage
														? ""
														: "border-2 border-dashed border-gray-300 hover:border-green-500"
												} rounded-full overflow-hidden transition-all duration-200`}
												style={{
													width: "120px",
													height: "120px",
													background: previewImage
														? `url(${previewImage}) center/cover`
														: "#f3f4f6",
												}}
											>
												{!previewImage && (
													<div className="text-center p-4">
														<svg
															className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-500"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M12 6v6m0 0v6m0-6h6m-6 0H6"
															/>
														</svg>
														<span className="mt-2 block text-xs text-gray-500 group-hover:text-green-600">
															Ajouter une photo
														</span>
													</div>
												)}
											</label>

											{/* Bouton pour changer si image déjà sélectionnée */}
											{previewImage && (
												<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200">
													<span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity duration-200">
														Changer
													</span>
												</div>
											)}
										</div>

										{/* Indication format fichier */}
										<p className="mt-2 text-xs text-gray-500">
											PNG, JPG (max. 2MB)
										</p>
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
												required
												minLength="8"
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
										<p className="mt-1 text-xs text-gray-500">
											Le mot de passe doit contenir au moins 8 caractères.
										</p>
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
												type={showConfirmPassword ? "text" : "password"}
												required
												className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
												placeholder="••••••••"
												value={formData.confirmPassword}
												onChange={handleChange}
											/>
											<button
												type="button"
												className="absolute inset-y-0 right-0 pr-3 flex items-center"
												onClick={toggleConfirmPasswordVisibility}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-5 w-5 text-gray-400" />
												) : (
													<Eye className="h-5 w-5 text-gray-400" />
												)}
											</button>
										</div>
									</div>

									<div className="bg-blue-50 p-4 rounded-lg">
										<div className="flex items-start">
											<div className="flex-shrink-0">
												<CheckCircle className="h-5 w-5 text-blue-600" />
											</div>
											<div className="ml-3">
												<p className="text-sm text-blue-700">
													Après l'inscription, vous recevrez un email de
													confirmation. Vous devrez vérifier votre adresse email
													avant de pouvoir vous connecter.
												</p>
											</div>
										</div>
									</div>

									<div className="flex space-x-4">
										<button
											type="button"
											onClick={prevStep}
											className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
										>
											<ArrowLeft className="mr-2 h-4 w-4" /> Précédent
										</button>
										<button
											type="submit"
											disabled={loading}
											className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
										>
											{loading ? "Inscription en cours..." : "S'inscrire"}
										</button>
									</div>
								</div>
							)}
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
			)}
		</div>
	);
}
