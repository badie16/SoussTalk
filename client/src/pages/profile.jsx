"use client";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Edit2,
	Camera,
	Check,
	X,
	AlertCircle,
	Lock,
	Eye,
	EyeOff,
	Bell,
	Shield,
	Download,
	Trash2,
	User,
	Settings,
} from "lucide-react";
import {
	getUserProfile,
	updateUserProfile,
	updateUserAvatar,
	changePassword,
	deleteAccount,
	exportUserData,
	updateUserPreferences,
} from "../services/userService";
import { logout, verifyToken } from "../services/authService";
import {
	ProfileCardSkeleton,
	SettingsSectionSkeleton,
} from "../components/Skeleton";
import "../index.css";
import "../theme.css";
import { useTheme } from "../context/ThemeContext";
import ThemeSelector from "../components/ThemeSelector";
import SessionManager from "../components/SessionManager";

const Profile = () => {
	const navigate = useNavigate();
	const { theme, changeTheme } = useTheme();

	// États pour les données du profil
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		phone: "",
		bio: "",
		profileImage: "/placeholder.svg",
	});

	// États pour l'édition
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState({
		name: "",
		email: "",
		phone: "",
		bio: "",
	});

	// États pour le changement de mot de passe
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	// États pour les préférences utilisateur
	const [preferences, setPreferences] = useState({
		theme: "light",
		notifications: true,
		privacy: "public",
		language: "fr",
	});
	const [isEditingPreferences, setIsEditingPreferences] = useState(false);
	const [editedPreferences, setEditedPreferences] = useState({
		theme: "light",
		notifications: true,
		privacy: "public",
		language: "fr",
	});

	// États pour la suppression de compte
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");

	// États pour le chargement et les erreurs
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// État pour suivre l'utilisateur actuel
	const [currentUser, setCurrentUser] = useState(null);

	// État pour l'onglet actif
	const [activeTab, setActiveTab] = useState("profile");

	// Ajouter un état pour gérer l'animation du contenu
	const [contentVisible, setContentVisible] = useState(true);

	// Modifier la fonction de changement d'onglet pour inclure une animation fluide
	const handleTabChange = (tab) => {
		if (tab === activeTab) return;

		// Masquer le contenu actuel
		setContentVisible(false);

		// Changer l'onglet après une courte transition
		setTimeout(() => {
			setActiveTab(tab);
			// Rendre le nouveau contenu visible
			setContentVisible(true);
		}, 150);
	};

	// Vérifier l'authentification
	useEffect(() => {
		const checkAuth = async () => {
			const result = await verifyToken();
			if (!result.valid) {
				navigate("/login");
			}
		};
		checkAuth();
	}, [navigate]);

	// Charger les données du profil
	const loadUserData = useCallback(async () => {
		setIsLoading(true);
		setError("");

		try {
			const user = JSON.parse(localStorage.getItem("user") || "{}");
			setCurrentUser(user);

			if (!user.id) {
				navigate("/login");
				return;
			}
			const response = await getUserProfile(user.id);

			if (!response.success) {
				setError(response.message || "Erreur lors du chargement du profil");
				console.error("Échec du chargement du profil:", response.message);
				return;
			}

			const profileData = response.data || {};

			// Add this log to debug the avatar URL
			console.log("Profile data loaded:", profileData);
			console.log("Avatar URL:", profileData.avatar_url);

			// Formater les données du profil
			setProfile({
				name: `${profileData.first_name || ""} ${
					profileData.last_name || ""
				}`.trim(),
				email: profileData.email || "",
				phone: profileData.phone_number || "",
				bio: profileData.bio || "No bio available",
				profileImage: profileData.avatar_url || "/placeholder.svg",
			});

			// Initialiser les données d'édition
			setEditedData({
				name: `${profileData.first_name || ""} ${
					profileData.last_name || ""
				}`.trim(),
				email: profileData.email || "",
				phone: profileData.phone_number || "",
				bio: profileData.bio || "",
			});

			// Charger les préférences utilisateur
			if (profileData.preferences) {
				try {
					const userPrefs =
						typeof profileData.preferences === "string"
							? JSON.parse(profileData.preferences)
							: profileData.preferences;

					setPreferences(userPrefs);
					setEditedPreferences(userPrefs);

					// Synchroniser avec le ThemeContext
					if (userPrefs.theme && userPrefs.theme !== theme) {
						changeTheme(userPrefs.theme);
					}
				} catch (e) {
					console.error("Erreur lors du parsing des préférences:", e);
				}
			}
		} catch (error) {
			console.error("Error loading profile data:", error);
			setError("Failed to load profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [navigate, theme, changeTheme]);

	// Charger les données au montage du composant
	useEffect(() => {
		loadUserData();
	}, [loadUserData]);

	// Gérer le basculement du mode édition
	const handleEditToggle = () => {
		if (isEditing) {
			// Annuler l'édition
			setEditedData({
				name: profile.name,
				email: profile.email,
				phone: profile.phone,
				bio: profile.bio,
			});
			setError("");
		}
		setIsEditing(!isEditing);
	};

	// Gérer le basculement de l'édition des préférences
	const handlePreferencesEditToggle = () => {
		if (isEditingPreferences) {
			// Annuler l'édition
			setEditedPreferences({ ...preferences });
			setError("");
		}
		setIsEditingPreferences(!isEditingPreferences);
	};

	// Gérer les changements dans les champs d'édition
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditedData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Gérer les changements dans les préférences
	const handlePreferenceChange = (e) => {
		const { name, value, type, checked } = e.target;
		setEditedPreferences((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// Gérer les changements dans les champs de mot de passe
	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Gérer le téléchargement d'image
	const handleImageUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validation côté client
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file (JPG, PNG, etc.)");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			setError("Image size should be less than 2MB");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			const result = await updateUserAvatar(currentUser.id, file);

			if (result.success) {
				setProfile((prev) => ({
					...prev,
					profileImage: result.data.avatar_url,
				}));
				setSuccessMessage("Photo de profil mise à jour avec succès!");

				// Effacer le message de succès après 3 secondes
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error uploading image:", error);
			setError("Failed to upload image. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Sauvegarder les modifications du profil
	const handleSaveChanges = async () => {
		// Validation des données
		if (!editedData.name.trim()) {
			setError("Name cannot be empty");
			return;
		}

		if (!editedData.email.trim()) {
			setError("Email cannot be empty");
			return;
		}

		// Validation simple de l'email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(editedData.email)) {
			setError("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			// Séparer le nom complet en prénom et nom
			const nameParts = editedData.name.trim().split(" ");
			const firstName = nameParts[0] || "";
			const lastName = nameParts.slice(1).join(" ") || "";

			const userData = {
				first_name: firstName,
				last_name: lastName,
				email: editedData.email,
				phone_number: editedData.phone,
				bio: editedData.bio,
			};

			const result = await updateUserProfile(currentUser.id, userData);

			if (result.success) {
				// Mettre à jour l'état du profil
				setProfile({
					name: editedData.name,
					email: editedData.email,
					phone: editedData.phone,
					bio: editedData.bio,
					profileImage: profile.profileImage,
				});

				setIsEditing(false);
				setSuccessMessage("Profil mis à jour avec succès!");

				// Effacer le message de succès après 3 secondes
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error saving profile changes:", error);
			setError("Failed to save changes. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Sauvegarder les préférences utilisateur
	const handleSavePreferences = async () => {
		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			const result = await updateUserPreferences(
				currentUser.id,
				editedPreferences
			);

			if (result.success) {
				setPreferences({ ...editedPreferences });
				setIsEditingPreferences(false);
				setSuccessMessage("Préférences mises à jour avec succès!");

				// Appliquer le thème si nécessaire
				if (editedPreferences.theme !== preferences.theme) {
					changeTheme(editedPreferences.theme);
				}

				// Effacer le message de succès après 3 secondes
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error saving preferences:", error);
			setError("Failed to save preferences. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Gérer le changement de mot de passe
	const handleSavePassword = async () => {
		// Validation des mots de passe
		if (!passwordData.currentPassword) {
			setError("Current password is required");
			return;
		}

		if (!passwordData.newPassword) {
			setError("New password is required");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			setError("New password must be at least 8 characters long");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			const result = await changePassword(
				currentUser.id,
				passwordData.currentPassword,
				passwordData.newPassword
			);

			if (result.success) {
				setIsChangingPassword(false);
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setSuccessMessage("Mot de passe changé avec succès!");

				// Effacer le message de succès après 3 secondes
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error changing password:", error);
			setError("Failed to change password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Exporter les données utilisateur
	const handleExportData = async () => {
		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			const result = await exportUserData(currentUser.id);

			if (result.success) {
				// Créer un fichier à télécharger
				const dataStr = JSON.stringify(result.data, null, 2);
				const dataBlob = new Blob([dataStr], { type: "application/json" });
				const url = URL.createObjectURL(dataBlob);

				// Créer un lien et déclencher le téléchargement
				const a = document.createElement("a");
				a.href = url;
				a.download = `user_data_${currentUser.id}.json`;
				document.body.appendChild(a);
				a.click();

				// Nettoyer
				URL.revokeObjectURL(url);
				document.body.removeChild(a);

				setSuccessMessage("Données exportées avec succès!");
				setTimeout(() => setSuccessMessage(""), 3000);
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error exporting data:", error);
			setError("Failed to export data. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Supprimer le compte
	const handleDeleteAccount = async () => {
		if (deleteConfirmation !== "SUPPRIMER") {
			setError("Veuillez saisir SUPPRIMER pour confirmer");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			if (!currentUser?.id) {
				navigate("/login");
				return;
			}

			const result = await deleteAccount(currentUser.id);

			if (result.success) {
				await logout();
				navigate("/login");
			} else {
				setError(result.message);
			}
		} catch (error) {
			console.error("Error deleting account:", error);
			setError("Failed to delete account. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Gérer la déconnexion
	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Error during logout:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Retourner à la page de chat
	const handleBackToChat = () => {
		navigate("/chat");
	};

	// Rendu des onglets
	const renderTabContent = () => {
		switch (activeTab) {
			case "profile":
				return renderProfileTab();
			case "security":
				return renderSecurityTab();
			case "preferences":
				return renderPreferencesTab();
			case "privacy":
				return renderPrivacyTab();
			default:
				return renderProfileTab();
		}
	};

	// Onglet Profil
	const renderProfileTab = () => {
		if (isLoading) {
			return <ProfileCardSkeleton />;
		}

		return (
			<>
				{/* Profile Header */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					{/* Cover Photo */}
					<div className="h-32 bg-gradient-to-r from-green-400 to-green-600"></div>

					{/* Profile Info */}
					<div className="px-6 pb-6">
						{/* Profile Image */}
						<div className="relative -mt-16 mb-4">
							<div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
								<img
									src={profile.profileImage || "/placeholder.svg"}
									alt="Profile"
									className="w-full h-full object-cover"
									onError={(e) => {
										console.log("Image failed to load:", e.target.src);
										e.target.onerror = null; // Prevent infinite loop
										e.target.src = "/placeholder.svg";
									}}
								/>
							</div>
							<label
								htmlFor="profile-image-upload"
								className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-green-600 transition-colors"
							>
								<Camera size={18} />
							</label>
							<input
								id="profile-image-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageUpload}
								disabled={isLoading}
							/>
						</div>

						{/* User Info */}
						<div className="space-y-6">
							{/* Name */}
							<div>
								<label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
									Nom complet
								</label>
								{isEditing ? (
									<input
										type="text"
										name="name"
										value={editedData.name}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="Votre nom complet"
									/>
								) : (
									<p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
										{profile.name || "Non défini"}
									</p>
								)}
							</div>

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
									Email
								</label>
								{isEditing ? (
									<input
										type="email"
										name="email"
										value={editedData.email}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="votre@email.com"
									/>
								) : (
									<div className="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-gray-500 dark:text-gray-400 mr-2"
										>
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
											<polyline points="22,6 12,13 2,6"></polyline>
										</svg>
										<p className="text-gray-800 dark:text-gray-200">
											{profile.email || "Non défini"}
										</p>
									</div>
								)}
							</div>

							{/* Phone */}
							<div>
								<label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
									Numéro de téléphone
								</label>
								{isEditing ? (
									<input
										type="tel"
										name="phone"
										value={editedData.phone}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="+212 6XX XXX XXX"
									/>
								) : (
									<div className="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-gray-500 dark:text-gray-400 mr-2"
										>
											<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
										</svg>
										<p className="text-gray-800 dark:text-gray-200">
											{profile.phone || "Non défini"}
										</p>
									</div>
								)}
							</div>

							{/* Bio */}
							<div>
								<label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
									Bio
								</label>
								{isEditing ? (
									<textarea
										name="bio"
										value={editedData.bio}
										onChange={handleInputChange}
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="Parlez-nous de vous..."
									></textarea>
								) : (
									<p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
										{profile.bio || "Aucune bio disponible"}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</>
		);
	};

	// Onglet Sécurité
	const renderSecurityTab = () => {
		if (isLoading) {
			return (
				<>
					<SettingsSectionSkeleton />
					<div className="mt-6">
						<SettingsSectionSkeleton />
					</div>
				</>
			);
		}

		return (
			<>
				{/* Password Change Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
							Changer le mot de passe
						</h2>
						<button
							onClick={() => setIsChangingPassword(!isChangingPassword)}
							className="text-green-600 hover:text-green-700 text-sm font-medium"
						>
							{isChangingPassword ? "Annuler" : "Changer"}
						</button>
					</div>

					{isChangingPassword ? (
						<div className="px-6 py-4 space-y-4">
							{/* Current Password */}
							<div>
								<label
									htmlFor="currentPassword"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Mot de passe actuel
								</label>
								<div className="relative">
									<input
										id="currentPassword"
										name="currentPassword"
										type={showCurrentPassword ? "text" : "password"}
										value={passwordData.currentPassword}
										onChange={handlePasswordChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="Entrez votre mot de passe actuel"
									/>
									<button
										type="button"
										onClick={() => setShowCurrentPassword(!showCurrentPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showCurrentPassword ? (
											<EyeOff size={18} className="text-gray-400" />
										) : (
											<Eye size={18} className="text-gray-400" />
										)}
									</button>
								</div>
							</div>

							{/* New Password */}
							<div>
								<label
									htmlFor="newPassword"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Nouveau mot de passe
								</label>
								<div className="relative">
									<input
										id="newPassword"
										name="newPassword"
										type={showNewPassword ? "text" : "password"}
										value={passwordData.newPassword}
										onChange={handlePasswordChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
										placeholder="Entrez le nouveau mot de passe"
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword(!showNewPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showNewPassword ? (
											<EyeOff size={18} className="text-gray-400" />
										) : (
											<Eye size={18} className="text-gray-400" />
										)}
									</button>
								</div>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Le mot de passe doit contenir au moins 8 caractères
								</p>
							</div>

							{/* Confirm New Password */}
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Confirmer le nouveau mot de passe
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									value={passwordData.confirmPassword}
									onChange={handlePasswordChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
									placeholder="Confirmez le nouveau mot de passe"
								/>
							</div>

							<div className="pt-2">
								<button
									onClick={handleSavePassword}
									disabled={isLoading}
									className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
								>
									{isLoading ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											Mise à jour...
										</>
									) : (
										<>
											<Lock size={16} className="mr-2" />
											Mettre à jour le mot de passe
										</>
									)}
								</button>
							</div>
						</div>
					) : (
						<div className="px-6 py-4">
							<p className="text-gray-600 dark:text-gray-400 text-sm">
								Pour des raisons de sécurité, nous vous recommandons de changer
								régulièrement votre mot de passe.
							</p>
						</div>
					)}
				</div>

				{/* Sessions Section - Utilisation du nouveau composant SessionManager */}
				<div className="mt-6">
					{currentUser ? (
						<SessionManager userId={currentUser.id} />
					) : (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-6">
							<p className="text-center text-gray-500 dark:text-gray-400">
								Impossible de charger les informations de session. Utilisateur
								non connecté.
							</p>
						</div>
					)}
				</div>
			</>
		);
	};

	// Onglet Préférences
	const renderPreferencesTab = () => {
		if (isLoading) {
			return <SettingsSectionSkeleton />;
		}

		return (
			<>
				{/* Utilisation du nouveau composant ThemeSelector */}
				<ThemeSelector />

				{/* Autres préférences utilisateur */}
				<div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
							Autres préférences
						</h2>
						<button
							onClick={handlePreferencesEditToggle}
							className="text-green-600 hover:text-green-700 text-sm font-medium"
						>
							{isEditingPreferences ? "Annuler" : "Modifier"}
						</button>
					</div>
					<div className="px-6 py-4 space-y-6">
						{/* Notifications */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Notifications
							</label>
							{isEditingPreferences ? (
								<div className="space-y-2">
									<label className="flex items-center">
										<input
											type="checkbox"
											name="notifications"
											checked={editedPreferences.notifications}
											onChange={handlePreferenceChange}
											className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
										/>
										<span className="ml-2">Activer les notifications</span>
									</label>
								</div>
							) : (
								<div className="flex items-center text-gray-800 dark:text-gray-200">
									<Bell size={18} className="mr-2 text-green-500" />
									{preferences.notifications
										? "Notifications activées"
										: "Notifications désactivées"}
								</div>
							)}
						</div>

						{/* Language */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Langue
							</label>
							{isEditingPreferences ? (
								<select
									name="language"
									value={editedPreferences.language}
									onChange={handlePreferenceChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
								>
									<option value="fr">Français</option>
									<option value="en">English</option>
									<option value="ar">العربية</option>
								</select>
							) : (
								<div className="flex items-center text-gray-800 dark:text-gray-200">
									<Globe size={18} className="mr-2 text-blue-500" />
									{preferences.language === "fr" && "Français"}
									{preferences.language === "en" && "English"}
									{preferences.language === "ar" && "العربية"}
								</div>
							)}
						</div>

						{/* Privacy */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Confidentialité
							</label>
							{isEditingPreferences ? (
								<select
									name="privacy"
									value={editedPreferences.privacy}
									onChange={handlePreferenceChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
								>
									<option value="public">
										Public - Tout le monde peut voir mon profil
									</option>
									<option value="contacts">
										Contacts - Seulement mes contacts peuvent voir mon profil
									</option>
									<option value="private">
										Privé - Personne ne peut voir mon profil
									</option>
								</select>
							) : (
								<div className="flex items-center text-gray-800 dark:text-gray-200">
									<Shield size={18} className="mr-2 text-red-500" />
									{preferences.privacy === "public" &&
										"Public - Tout le monde peut voir votre profil"}
									{preferences.privacy === "contacts" &&
										"Contacts - Seulement vos contacts peuvent voir votre profil"}
									{preferences.privacy === "private" &&
										"Privé - Personne ne peut voir votre profil"}
								</div>
							)}
						</div>

						{isEditingPreferences && (
							<div className="pt-2">
								<button
									onClick={handleSavePreferences}
									disabled={isLoading}
									className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
								>
									{isLoading ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
											Enregistrement...
										</>
									) : (
										<>
											<Check size={16} className="mr-2" />
											Enregistrer les préférences
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			</>
		);
	};

	// Onglet Confidentialité
	const renderPrivacyTab = () => {
		if (isLoading) {
			return (
				<>
					<SettingsSectionSkeleton />
					<div className="mt-6">
						<SettingsSectionSkeleton />
					</div>
				</>
			);
		}

		return (
			<>
				{/* Data Export Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
							Exportation des données
						</h2>
					</div>
					<div className="px-6 py-4">
						<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
							Vous pouvez exporter toutes vos données personnelles dans un
							format JSON. Cela inclut votre profil, vos préférences et votre
							historique de messages.
						</p>
						<button
							onClick={handleExportData}
							disabled={isLoading}
							className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
						>
							{isLoading ? (
								<>
									<div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
									Exportation...
								</>
							) : (
								<>
									<Download size={16} className="mr-2" />
									Exporter mes données
								</>
							)}
						</button>
					</div>
				</div>

				{/* Account Deletion Section */}
				<div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
							Suppression du compte
						</h2>
					</div>
					<div className="px-6 py-4">
						<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<AlertCircle
										className="h-5 w-5 text-red-400"
										aria-hidden="true"
									/>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800 dark:text-red-300">
										Attention
									</h3>
									<div className="mt-2 text-sm text-red-700 dark:text-red-400">
										<p>
											La suppression de votre compte est irréversible. Toutes
											vos données personnelles, messages et fichiers seront
											définitivement supprimés.
										</p>
									</div>
								</div>
							</div>
						</div>

						{isConfirmingDelete ? (
							<div className="space-y-4">
								<p className="text-gray-600 dark:text-gray-400 text-sm">
									Pour confirmer la suppression, veuillez saisir{" "}
									<span className="font-bold">SUPPRIMER</span> ci-dessous:
								</p>
								<input
									type="text"
									value={deleteConfirmation}
									onChange={(e) => setDeleteConfirmation(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
									placeholder="SUPPRIMER"
								/>
								<div className="flex space-x-3">
									<button
										onClick={() => setIsConfirmingDelete(false)}
										className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
									>
										Annuler
									</button>
									<button
										onClick={handleDeleteAccount}
										disabled={isLoading || deleteConfirmation !== "SUPPRIMER"}
										className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
									>
										{isLoading ? (
											<>
												<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
												Suppression...
											</>
										) : (
											<>
												<Trash2 size={16} className="mr-2" />
												Supprimer définitivement
											</>
										)}
									</button>
								</div>
							</div>
						) : (
							<button
								onClick={() => setIsConfirmingDelete(true)}
								className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								<Trash2 size={16} className="mr-2" />
								Supprimer mon compte
							</button>
						)}
					</div>
				</div>
			</>
		);
	};

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900  themed-page">
			{/* Top Navigation */}
			<div className="bg-white dark:bg-gray-800 shadow-sm">
				<div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
					<button
						onClick={handleBackToChat}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
					</button>
					<h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
						Profil
					</h1>
					<div className="ml-auto">
						{isEditing ? (
							<div className="flex space-x-2">
								<button
									onClick={handleEditToggle}
									className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									disabled={isLoading}
								>
									<X size={20} className="text-red-500" />
								</button>
								<button
									onClick={handleSaveChanges}
									className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									disabled={isLoading}
								>
									{isLoading ? (
										<div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
									) : (
										<Check size={20} className="text-green-500" />
									)}
								</button>
							</div>
						) : activeTab === "profile" && !isLoading ? (
							<button
								onClick={handleEditToggle}
								className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								<Edit2 size={20} className="text-gray-700 dark:text-gray-300" />
							</button>
						) : null}
					</div>
				</div>
			</div>

			{/* Messages de succès et d'erreur */}
			{successMessage && (
				<div className="max-w-3xl mx-auto mt-4 px-4">
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-start">
						<Check size={20} className="mr-2 flex-shrink-0 mt-0.5" />
						<span>{successMessage}</span>
					</div>
				</div>
			)}

			{error && (
				<div className="max-w-3xl mx-auto mt-4 px-4">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start">
						<AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				</div>
			)}

			{/* Tabs Navigation */}
			<div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
				<div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
					<button
						onClick={() => handleTabChange("profile")}
						className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
							activeTab === "profile"
								? "text-green-600 border-b-2 border-green-500 dark:text-green-400 dark:border-green-400"
								: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						}`}
					>
						<div className="flex items-center">
							<User size={16} className="mr-1" />
							Profil
						</div>
					</button>
					<button
						onClick={() => handleTabChange("security")}
						className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
							activeTab === "security"
								? "text-green-600 border-b-2 border-green-500 dark:text-green-400 dark:border-green-400"
								: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						}`}
					>
						<div className="flex items-center">
							<Lock size={16} className="mr-1" />
							Sécurité
						</div>
					</button>
					<button
						onClick={() => handleTabChange("preferences")}
						className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
							activeTab === "preferences"
								? "text-green-600 border-b-2 border-green-500 dark:text-green-400 dark:border-green-400"
								: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						}`}
					>
						<div className="flex items-center">
							<Settings size={16} className="mr-1" />
							Préférences
						</div>
					</button>
					<button
						onClick={() => handleTabChange("privacy")}
						className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
							activeTab === "privacy"
								? "text-green-600 border-b-2 border-green-500 dark:text-green-400 dark:border-green-400"
								: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						}`}
					>
						<div className="flex items-center">
							<Shield size={16} className="mr-1" />
							Confidentialité
						</div>
					</button>
				</div>
			</div>

			{/* Profile Content */}
			<div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
				<div
					className={`transition-opacity duration-150 ease-in-out ${
						contentVisible ? "opacity-100" : "opacity-0"
					}`}
				>
					{renderTabContent()}
				</div>
			</div>
		</div>
	);
};

// Composant Globe pour l'icône de langue
const Globe = ({ size, className }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="2" y1="12" x2="22" y2="12"></line>
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
		</svg>
	);
};

export default Profile;
