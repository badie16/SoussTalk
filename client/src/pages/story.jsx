"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Plus, Camera, Clock } from "lucide-react";
import {
	getActiveStories,
	createStory,
	uploadMedia,
	markStoryAsViewed,
	getViewedStories,
} from "../services/storyService";
import { getFriends } from "../services/friendService";
import StoryViewer from "../pages/storyViewer";
import SideNav from "../components/SideNav";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Stories = () => {
	const navigate = useNavigate();
	const [stories, setStories] = useState([]);
	const [recentStories, setRecentStories] = useState([]);
	const [viewedStories, setViewedStories] = useState([]);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [textContent, setTextContent] = useState("");
	const [activeTab, setActiveTab] = useState("media");
	const fileInputRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [activeIcon, setActiveIcon] = useState("story");
	const [selectedStory, setSelectedStory] = useState(null);
	const [bgColor, setBgColor] = useState(
		"bg-gradient-to-r from-purple-500 to-pink-500"
	);
	const [friends, setFriends] = useState([]);
	const [myStory, setMyStory] = useState(null);
	const [userData, setUserData] = useState(null);
	const [viewedStoryIds, setViewedStoryIds] = useState([]);

	const gradients = [
		"bg-gradient-to-r from-purple-500 to-pink-500",
		"bg-gradient-to-r from-blue-500 to-teal-500",
		"bg-gradient-to-r from-green-500 to-yellow-500",
		"bg-gradient-to-r from-red-500 to-orange-500",
		"bg-gradient-to-r from-indigo-500 to-purple-500",
	];

	// Vérifier si l'utilisateur est connecté
	useEffect(() => {
		const userDataStr = localStorage.getItem("user");
		if (!userDataStr) {
			navigate("/login");
			return;
		}

		try {
			const parsedUserData = JSON.parse(userDataStr);
			setUserData(parsedUserData);
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des données utilisateur:",
				error
			);
			navigate("/login");
		}
	}, [navigate]);

	useEffect(() => {
		if (userData) {
			fetchStories();
			fetchFriends();
			fetchViewedStories();
		}
	}, [userData]);

	const fetchViewedStories = async () => {
		try {
			const res = await getViewedStories();
			if (res.success) {
				const viewedIds = res.data.map((story) => story.id);
				setViewedStoryIds(viewedIds);
			}
		} catch (error) {
			console.error("Erreur récupération stories vues:", error);
		}
	};

	// Ajouter cette fonction après la fonction fetchViewedStories
	const groupStoriesByUser = (storiesList) => {
		const userStories = {};

		// Regrouper les stories par utilisateur
		storiesList.forEach((story) => {
			if (!userStories[story.user_id]) {
				userStories[story.user_id] = {
					user_id: story.user_id,
					stories: [],
					latestStory: null,
					hasUnviewed: false,
				};
			}

			userStories[story.user_id].stories.push(story);

			// Mettre à jour la story la plus récente
			if (
				!userStories[story.user_id].latestStory ||
				new Date(story.created_at) >
					new Date(userStories[story.user_id].latestStory.created_at)
			) {
				userStories[story.user_id].latestStory = story;
			}

			// Vérifier si cette story n'a pas été vue
			if (!viewedStoryIds.includes(story.id)) {
				userStories[story.user_id].hasUnviewed = true;
			}
		});

		return Object.values(userStories);
	};

	useEffect(() => {
		// Organiser les stories
		if (stories.length > 0 && userData) {
			// Trouver ma story
			const myStories = stories.filter(
				(story) => story.user_id === userData.id
			);
			if (myStories.length > 0) {
				setMyStory(myStories[0]);
			}

			// Filtrer les stories des autres utilisateurs
			const otherStories = stories.filter(
				(story) => story.user_id !== userData.id
			);

			// Regrouper les stories par utilisateur
			const groupedStories = groupStoriesByUser(otherStories);

			// Séparer les groupes avec des stories non vues et vues
			const unviewed = groupedStories.filter((group) => group.hasUnviewed);
			const viewed = groupedStories.filter((group) => !group.hasUnviewed);

			setRecentStories(unviewed);
			setViewedStories(viewed);
		}
	}, [stories, userData, viewedStoryIds]);

	const fetchStories = async () => {
		try {
			const res = await getActiveStories();
			if (res.success) {
				setStories(Array.isArray(res.data) ? res.data : []);
			} else {
				console.error("Erreur récupération stories:", res.message);
			}
		} catch (error) {
			console.error("Erreur fetchStories:", error);
		}
	};

	const fetchFriends = async () => {
		if (!userData) return;

		try {
			const response = await getFriends(userData.id);
			if (response.success) {
				setFriends(response.data || []);
			}
		} catch (error) {
			console.error("Erreur récupération amis:", error);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
			setActiveTab("media");
			setShowAddMenu(true);
		}
	};

	const handleAddStory = async () => {
		if (!userData) {
			navigate("/login");
			return;
		}

		if (
			(activeTab === "media" && !selectedFile) ||
			(activeTab === "text" && !textContent.trim())
		) {
			return;
		}

		setLoading(true);
		try {
			let mediaUrl = "";
			let type = "text";

			if (activeTab === "media" && selectedFile) {
				const uploadResult = await uploadMedia(selectedFile);
				if (uploadResult && typeof uploadResult === "string") {
					mediaUrl = uploadResult;
				} else if (uploadResult && uploadResult.url) {
					mediaUrl = uploadResult.url;
				} else {
					throw new Error("Échec de l'upload du média");
				}
				type = selectedFile.type.includes("video") ? "video" : "photo";
			}

			const storyData = {
				user_id: userData.id,
				media_url: activeTab === "media" ? mediaUrl : "",
				type,
				caption: textContent,
				background: activeTab === "text" ? bgColor : "",
			};

			const result = await createStory(storyData);

			if (result.success) {
				setSelectedFile(null);
				setTextContent("");
				setShowAddMenu(false);
				fetchStories();
			} else {
				console.error(
					"Erreur lors de la création de la story:",
					result.message
				);
			}
		} catch (error) {
			console.error("Error creating story:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleIconClick = (iconName) => {
		setActiveIcon(iconName);
	};

	const openStoryView = async (userStoryGroup) => {
		// Si on reçoit un groupe, on prend la première story
		const story = userStoryGroup.latestStory || userStoryGroup;

		setSelectedStory(story);

		// Marquer la story comme vue si elle n'est pas la mienne
		if (
			userData &&
			story.user_id !== userData.id &&
			!viewedStoryIds.includes(story.id)
		) {
			try {
				await markStoryAsViewed(story.id);
				// Mettre à jour la liste des stories vues
				setViewedStoryIds((prev) => [...prev, story.id]);
			} catch (error) {
				console.error("Erreur lors du marquage de la story comme vue:", error);
			}
		}
	};

	const formatTime = (timestamp) => {
		if (!timestamp) return "Récemment";
		try {
			return formatDistanceToNow(new Date(timestamp), {
				addSuffix: true,
				locale: fr,
			});
		} catch (error) {
			return "Récemment";
		}
	};

	const getUsernameById = (userId) => {
		// Si c'est mon ID, retourner "Moi"
		if (userData && userId === userData.id) {
			return "Moi";
		}

		// Chercher dans les amis
		const friend = friends.find(
			(f) => f.id === userId || f.friend_id === userId
		);
		if (friend) {
			return friend.username || friend.name || "Utilisateur";
		}

		// Chercher dans les stories (au cas où l'utilisateur a des informations)
		const storyWithUser = stories.find((s) => s.user_id === userId && s.users);
		if (storyWithUser && storyWithUser.users) {
			return storyWithUser.users.username || "Utilisateur";
		}

		return "Utilisateur";
	};

	if (!userData) {
		return null; // Ne rien afficher pendant la vérification de l'authentification
	}

	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900 themed-page overflow-hidden">
			{/* Barre latérale de navigation */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />

			<div className="flex flex-1 ml-[60px]">
				{/* Panneau de gauche - Liste des stories */}
				<div className="w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
					<div className="p-4">
						<h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
							Status
						</h1>

						{/* Ma story */}
						<div className="mb-6">
							<div
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
								onClick={() => {
									if (myStory) {
										openStoryView(myStory);
									} else {
										setActiveTab("media");
										setShowAddMenu(true);
									}
								}}
							>
								<div className="relative">
									<div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
										{myStory && myStory.type === "photo" ? (
											<img
												src={
													myStory.media_url  || 
													"/placeholder.svg?height=48&width=48"
												}
												alt="Ma story"
												className="w-full h-full object-cover"
											/>
										) : (
											<UserCircle className="w-full h-full text-gray-500 dark:text-gray-400" />
										)}
									</div>
									<div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 shadow-lg">
										<Plus size={12} className="text-white z-10" />
									</div>
								</div>
								<div>
									<p className="font-medium text-gray-800 dark:text-white">
										My status
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{myStory ? formatTime(myStory.created_at) : "No updates"}
									</p>
								</div>
							</div>
						</div>

						{/* Stories récentes */}
						{recentStories.length > 0 && (
							<div className="mb-6">
								<h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 px-3">
									Recent updates
								</h2>

								{recentStories.map((userStoryGroup) => (
									<div
										key={`user-${userStoryGroup.user_id}`}
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
										onClick={() => openStoryView(userStoryGroup)}
									>
										<div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-green-400 to-blue-500">
											{userStoryGroup.latestStory.type === "text" ? (
												<div
													className={`w-full h-full rounded-full flex items-center justify-center ${
														userStoryGroup.latestStory.background ||
														"bg-gradient-to-r from-purple-500 to-pink-500"
													}`}
												>
													<span className="text-white font-bold text-lg">
														{getUsernameById(userStoryGroup.user_id)
															.charAt(0)
															.toUpperCase()}
													</span>
												</div>
											) : (
												<img
													src={
														userStoryGroup.latestStory.media_url ||
														"/placeholder.svg?height=48&width=48"
													}
													alt="Story"
													className="w-full h-full object-cover rounded-full"
												/>
											)}
										</div>
										<div>
											<p className="font-medium text-gray-800 dark:text-white">
												{getUsernameById(userStoryGroup.user_id)}
											</p>
											<div className="flex items-center">
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{formatTime(userStoryGroup.latestStory.created_at)}
												</p>
												{userStoryGroup.stories.length > 1 && (
													<span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
														{userStoryGroup.stories.length}
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Stories vues */}
						{viewedStories.length > 0 && (
							<div>
								<h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 px-3">
									Viewed updates
								</h2>

								{viewedStories.map((userStoryGroup) => (
									<div
										key={`user-${userStoryGroup.user_id}`}
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
										onClick={() => openStoryView(userStoryGroup)}
									>
										<div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
											{userStoryGroup.latestStory.type === "text" ? (
												<div
													className={`w-full h-full rounded-full flex items-center justify-center ${
														userStoryGroup.latestStory.background ||
														"bg-gradient-to-r from-purple-500 to-pink-500"
													}`}
												>
													<span className="text-white font-bold text-lg">
														{getUsernameById(userStoryGroup.user_id)
															.charAt(0)
															.toUpperCase()}
													</span>
												</div>
											) : (
												<img
													src={
														userStoryGroup.latestStory.media_url ||
														"/placeholder.svg?height=48&width=48"
													}
													alt="Story"
													className="w-full h-full object-cover rounded-full"
												/>
											)}
										</div>
										<div>
											<p className="font-medium text-gray-800 dark:text-white">
												{getUsernameById(userStoryGroup.user_id)}
											</p>
											<div className="flex items-center">
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{formatTime(userStoryGroup.latestStory.created_at)}
												</p>
												{userStoryGroup.stories.length > 1 && (
													<span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
														{userStoryGroup.stories.length}
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Aucune story */}
						{recentStories.length === 0 &&
							viewedStories.length === 0 &&
							!myStory && (
								<div className="text-center py-8">
									<p className="text-gray-500 dark:text-gray-400 mb-4">
										Aucune story disponible
									</p>
									<button
										onClick={() => setShowAddMenu(true)}
										className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
									>
										Créer une story
									</button>
								</div>
							)}
					</div>
				</div>

				{/* Panneau de droite - Visualiseur de story */}
				<div className="w-2/3 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
					{selectedStory ? (
						<StoryViewer
							story={selectedStory}
							onClose={() => setSelectedStory(null)}
							stories={stories.filter(
								(s) => s.user_id === selectedStory.user_id
							)}
							setSelectedStory={setSelectedStory}
							username={getUsernameById(selectedStory.user_id)}
							currentUserId={userData.id}
						/>
					) : (
						<div className="text-center p-8">
							<div className="mb-4">
								<Camera size={48} className="mx-auto text-gray-400" />
							</div>
							<h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
								Cliquez sur un contact pour voir ses stories
							</h2>
							<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
								Sélectionnez une story dans la liste à gauche pour la visualiser
								ici
							</p>

							<div className="mt-12 flex items-center justify-center text-gray-500 dark:text-gray-400">
								<Clock size={16} className="mr-2" />
								<span className="text-sm">
									Les stories disparaissent après 24 heures
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Modal d'ajout de story */}
			{showAddMenu && (
				<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-4 shadow-xl">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-gray-800 dark:text-white">
								Créer une story
							</h2>
							<button
								onClick={() => setShowAddMenu(false)}
								className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								<span className="sr-only">Fermer</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-gray-600 dark:text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
							<button
								className={`py-2 px-4 font-medium flex items-center gap-2 ${
									activeTab === "media"
										? "text-green-600 border-b-2 border-green-600"
										: "text-gray-600 dark:text-gray-400"
								}`}
								onClick={() => setActiveTab("media")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<span>Photos & Vidéos</span>
							</button>
							<button
								className={`py-2 px-4 font-medium flex items-center gap-2 ${
									activeTab === "text"
										? "text-green-600 border-b-2 border-green-600"
										: "text-gray-600 dark:text-gray-400"
								}`}
								onClick={() => setActiveTab("text")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16m-7 6h7"
									/>
								</svg>
								<span>Texte</span>
							</button>
						</div>

						{activeTab === "media" ? (
							<div className="flex flex-col items-center py-4">
								{selectedFile ? (
									<div className="w-full">
										{selectedFile.type.includes("video") ? (
											<video
												src={URL.createObjectURL(selectedFile)}
												controls
												className="max-h-64 w-full rounded-lg object-contain"
											/>
										) : (
											<img
												src={
													URL.createObjectURL(selectedFile) ||
													"/placeholder.svg?height=256&width=256"
												}
												alt="Preview"
												className="max-h-64 w-full object-contain rounded-lg"
											/>
										)}
										<textarea
											className="w-full mt-4 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
											placeholder="Ajouter une légende..."
											value={textContent}
											onChange={(e) => setTextContent(e.target.value)}
											rows={2}
										/>
									</div>
								) : (
									<div
										className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer w-full"
										onClick={() => fileInputRef.current.click()}
									>
										<div className="flex flex-col items-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-12 w-12 text-gray-400 mb-2"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											<p className="text-gray-600 dark:text-gray-400 mb-1">
												Sélectionner une photo ou vidéo
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-500">
												JPG, PNG ou MP4
											</p>
										</div>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleFileChange}
											accept="image/*,video/*"
											className="hidden"
										/>
									</div>
								)}
							</div>
						) : (
							<div className="py-4">
								<div className="flex flex-wrap gap-2 mb-4">
									{gradients.map((gradient, index) => (
										<button
											key={index}
											className={`w-8 h-8 rounded-full ${gradient} ${
												bgColor === gradient
													? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800"
													: ""
											}`}
											onClick={() => setBgColor(gradient)}
										/>
									))}
								</div>
								<div
									className={`w-full h-40 ${bgColor} rounded-lg p-4 flex items-center justify-center mb-4`}
								>
									<textarea
										className="w-full h-full bg-transparent text-white text-center resize-none border-none focus:ring-0 focus:outline-none placeholder-white placeholder-opacity-70"
										placeholder="Écrivez votre message..."
										value={textContent}
										onChange={(e) => setTextContent(e.target.value)}
									/>
								</div>
							</div>
						)}

						<div className="flex justify-end gap-2 mt-2">
							<button
								className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								onClick={() => setShowAddMenu(false)}
							>
								Annuler
							</button>
							<button
								className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
								onClick={handleAddStory}
								disabled={
									loading ||
									(activeTab === "media" && !selectedFile) ||
									(activeTab === "text" && !textContent.trim())
								}
							>
								{loading ? (
									"Publication..."
								) : (
									<>
										<span>Publier</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
											/>
										</svg>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
};

export default Stories;
