"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Search,
	Phone,
	Video,
	MessageSquare,
	UserPlus,
	MoreVertical,
	X,
	User,
} from "lucide-react";
import "../index.css";
import SideNav from "../components/SideNav";
import {
	getFriends,
	searchFriends,
	removeFriend,
	startCall,
} from "../services/friendService";
import messageService from "../services/messageService";
import { createNotification } from "../components/notifications";

const Contacts = () => {
	const navigate = useNavigate();
	const [activeIcon, setActiveIcon] = useState("users");
	const [friends, setFriends] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState(null);
	const [selectedFriend, setSelectedFriend] = useState(null);
	const [showProfileModal, setShowProfileModal] = useState(false);

	// Charger l'utilisateur et ses amis
	useEffect(() => {
		const loadUserAndFriends = async () => {
			setIsLoading(true);

			// Vérifier l'authentification de l'utilisateur
			const userData = localStorage.getItem("user");
			if (!userData) {
				navigate("/login");
				return;
			}

			try {
				// Analyser les données de l'utilisateur
				const user = JSON.parse(userData);
				setCurrentUser(user);

				// Récupérer les amis depuis l'API
				const response = await getFriends();
				if (response.success) {
					setFriends(response.data);
				} else {
					console.error("Échec du chargement des amis:", response.message);
				}
			} catch (error) {
				console.error("Erreur lors du chargement des données:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserAndFriends();
	}, [navigate]);

	// Gérer le clic sur l'icône
	const handleIconClick = (iconName) => {
		setActiveIcon(iconName);
	};

	// Rechercher des amis
	const handleSearch = async () => {
		if (!searchQuery.trim() || !currentUser) return;

		setIsLoading(true);
		try {
			const response = await searchFriends(currentUser.id, searchQuery);
			if (response.success) {
				setFriends(response.data);
			} else {
				console.error("Échec de la recherche d'amis:", response.message);
			}
		} catch (error) {
			console.error("Erreur lors de la recherche d'amis:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Réinitialiser la recherche
	const resetSearch = async () => {
		if (!currentUser) return;
		setSearchQuery("");
		setIsLoading(true);
		try {
			const response = await getFriends(currentUser.id);
			if (response.success) {
				setFriends(response.data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des amis:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Démarrer un chat avec un ami - AMÉLIORÉ
	const handleStartChat = async (friend) => {
		if (!currentUser) return;

		try {
			// Créer ou récupérer la conversation
			const conversation = await messageService.createPrivateConversation(
				friend.id
			);

			// Préparer les données de la conversation
			const chatData = {
				id: conversation.id,
				name: friend.name,
				avatar: friend.avatar_url,
				isGroup: false,
				userId: friend.id,
				online: friend.is_online,
			};

			// Créer une notification de succès
			createNotification(
				"message",
				"Conversation ouverte",
				`Conversation avec ${friend.name} ouverte`,
				{
					friendId: friend.id,
				}
			);

			// Rediriger vers la page de chat avec la conversation sélectionnée
			navigate("/chat", {
				state: {
					selectedChat: chatData,
					autoSelect: true,
				},
			});
		} catch (error) {
			console.error("Échec du démarrage du chat:", error);

			// Créer une notification d'erreur
			createNotification(
				"error",
				"Erreur",
				"Impossible d'ouvrir la conversation. Veuillez réessayer.",
				{}
			);
		}
	};

	// Démarrer un appel avec un ami
	const handleStartCall = async (friend, isVideo = false) => {
		if (!currentUser) return;

		try {
			const response = await startCall(currentUser.id, friend.id, isVideo);
			if (response.success) {
				// Rediriger vers la page d'appel ou afficher une interface d'appel
				console.log("Appel démarré:", response.data);

				// Créer une notification
				createNotification(
					"call",
					`Appel ${isVideo ? "vidéo" : "audio"}`,
					`Appel ${isVideo ? "vidéo" : "audio"} avec ${friend.name} démarré`,
					{ friendId: friend.id, isVideo }
				);

				// Pour l'instant, nous affichons juste une alerte
				alert(
					`Démarrage d'un appel ${isVideo ? "vidéo" : "audio"} avec ${
						friend.name
					}`
				);
			} else {
				console.error("Échec du démarrage de l'appel:", response.message);
			}
		} catch (error) {
			console.error("Erreur lors du démarrage de l'appel:", error);
		}
	};

	// Supprimer un ami
	const handleRemoveFriend = async (friend) => {
		if (!currentUser) return;

		if (
			window.confirm(
				`Êtes-vous sûr de vouloir supprimer ${friend.name} de vos amis ?`
			)
		) {
			try {
				const response = await removeFriend(currentUser.id, friend.id);
				if (response.success) {
					setFriends(friends.filter((f) => f.id !== friend.id));
					if (selectedFriend?.id === friend.id) {
						setSelectedFriend(null);
						setShowProfileModal(false);
					}

					// Créer une notification
					createNotification(
						"friend_request",
						"Ami supprimé",
						`${friend.name} a été supprimé de vos amis`,
						{
							friendId: friend.id,
						}
					);
				} else {
					console.error("Échec de la suppression de l'ami:", response.message);
				}
			} catch (error) {
				console.error("Erreur lors de la suppression de l'ami:", error);
			}
		}
	};

	// Voir le profil d'un ami
	const handleViewProfile = (friend) => {
		setSelectedFriend(friend);
		setShowProfileModal(true);
	};

	// Filtrer les amis en fonction de la recherche
	const filteredFriends = friends.filter(
		(friend) =>
			friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(friend.email &&
				friend.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(friend.phone &&
				friend.phone.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900  themed-page overflow-hidden">
			{/* Barre latérale de navigation */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />

			{/* Zone de contenu - avec marge gauche pour tenir compte de la barre latérale fixe */}
			<div className="flex flex-1 ml-[60px]">
				<div className="w-full overflow-y-auto">
					<div className="h-full flex flex-col">
						{/* En-tête */}
						<div className="p-4 flex justify-between items-center">
							<h1 className="text-xl font-semibold text-white">Mes Amis</h1>
							<Link
								to="/find-friends"
								className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
							>
								<UserPlus size={20} />
							</Link>
						</div>

						{/* Recherche */}
						<div className="px-4 pb-4">
							<div className="relative">
								<input
									type="text"
									placeholder="Rechercher un ami..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
									className="w-full bg-white dark:bg-gray-800 shadow-sm text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								{searchQuery ? (
									<button
										onClick={resetSearch}
										className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-200"
									>
										<X size={18} />
									</button>
								) : null}
								<button
									onClick={handleSearch}
									className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
								>
									<Search className="h-5 w-5" />
								</button>
							</div>
						</div>

						{/* Liste des amis */}
						<div className="flex-1 overflow-y-auto">
							{isLoading ? (
								<div className="flex justify-center items-center h-32">
									<div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
								</div>
							) : (
								<div>
									{filteredFriends.length > 0 ? (
										filteredFriends.map((friend) => (
											<FriendItem
												key={friend.id}
												friend={friend}
												onChat={() => handleStartChat(friend)}
												onCall={() => handleStartCall(friend, false)}
												onVideoCall={() => handleStartCall(friend, true)}
												onViewProfile={() => handleViewProfile(friend)}
												onRemove={() => handleRemoveFriend(friend)}
											/>
										))
									) : (
										<div className="px-4 py-8 text-center">
											<p className="text-gray-400">
												{searchQuery
													? `Aucun ami trouvé pour "${searchQuery}"`
													: "Vous n'avez pas encore d'amis. Allez à la page 'Trouver des amis' pour commencer."}
											</p>
											{!searchQuery && (
												<Link
													to="/find-friends"
													className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
												>
													Trouver des amis
												</Link>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Modal de profil d'ami */}
			{showProfileModal && selectedFriend && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-[#2a3447] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
						{/* En-tête du modal */}
						<div className="flex justify-between items-center p-4 border-b border-gray-700">
							<h2 className="text-xl font-semibold text-white">
								Profil de {selectedFriend.name}
							</h2>
							<button
								onClick={() => setShowProfileModal(false)}
								className="text-gray-400 hover:text-white transition-colors"
							>
								<X size={24} />
							</button>
						</div>

						{/* Contenu du profil */}
						<div className="p-4">
							{/* Avatar et informations de base */}
							<div className="flex flex-col items-center mb-6">
								<div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-700">
									{selectedFriend.avatar ? (
										<img
											src={selectedFriend.avatar || "/placeholder.svg"}
											alt={selectedFriend.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-green-600 text-white text-2xl font-semibold">
											{selectedFriend.initials || selectedFriend.name.charAt(0)}
										</div>
									)}
								</div>
								<h3 className="text-xl font-semibold text-white mb-1">
									{selectedFriend.name}
								</h3>
								{selectedFriend.status && (
									<p className="text-gray-400 text-sm mb-2">
										{selectedFriend.status}
									</p>
								)}
								<div className="flex space-x-2 mt-2">
									<button
										onClick={() => handleStartChat(selectedFriend)}
										className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
										title="Envoyer un message"
									>
										<MessageSquare size={20} />
									</button>
									<button
										onClick={() => handleStartCall(selectedFriend, false)}
										className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
										title="Appel audio"
									>
										<Phone size={20} />
									</button>
									<button
										onClick={() => handleStartCall(selectedFriend, true)}
										className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
										title="Appel vidéo"
									>
										<Video size={20} />
									</button>
								</div>
							</div>

							{/* Informations détaillées */}
							{selectedFriend.email && (
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-400 mb-1">
										Email
									</h4>
									<p className="text-white">{selectedFriend.email}</p>
								</div>
							)}

							{selectedFriend.phone && (
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-400 mb-1">
										Téléphone
									</h4>
									<p className="text-white">{selectedFriend.phone}</p>
								</div>
							)}

							{selectedFriend.bio && (
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-400 mb-1">
										Bio
									</h4>
									<p className="text-white">{selectedFriend.bio}</p>
								</div>
							)}

							{/* Actions supplémentaires */}
							<div className="mt-6 pt-4 border-t border-gray-700">
								<button
									onClick={() => {
										handleRemoveFriend(selectedFriend);
									}}
									className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
								>
									Supprimer de mes amis
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
};

// Composant d'élément ami
function FriendItem({
	friend,
	onChat,
	onCall,
	onVideoCall,
	onViewProfile,
	onRemove,
}) {
	const [showActions, setShowActions] = useState(false);

	return (
		<div className="relative flex items-center px-4 py-3 hover:bg-[#2a3447] transition-colors">
			{/* Avatar de l'utilisateur */}
			<div className="relative mr-3" onClick={onViewProfile}>
				{friend.avatar ? (
					<img
						src={friend.avatar || "/placeholder.svg"}
						alt={friend.name}
						className="h-12 w-12 rounded-full object-cover cursor-pointer"
					/>
				) : (
					<div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-600 text-white cursor-pointer">
						<span className="font-medium">
							{friend.initials || friend.name.charAt(0)}
						</span>
					</div>
				)}
				{friend.online && (
					<span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-1 ring-[#1a2236]" />
				)}
			</div>

			{/* Informations sur l'ami */}
			<div
				className="flex-1 min-w-0 pr-2 cursor-pointer"
				onClick={onViewProfile}
			>
				<p className="text-base font-medium text-white truncate">
					{friend.name}
				</p>
				<p className="text-sm text-gray-400 truncate">
					{friend.status || (friend.online ? "En ligne" : "Hors ligne")}
				</p>
			</div>

			{/* Actions rapides */}
			<div className="flex items-center space-x-2">
				<button
					onClick={onChat}
					className="p-2 text-gray-400 hover:text-white hover:bg-[#3a4457] rounded-full transition-colors"
					title="Envoyer un message"
				>
					<MessageSquare size={18} />
				</button>
				<button
					onClick={onCall}
					className="p-2 text-gray-400 hover:text-white hover:bg-[#3a4457] rounded-full transition-colors"
					title="Appel audio"
				>
					<Phone size={18} />
				</button>
				<button
					onClick={onVideoCall}
					className="p-2 text-gray-400 hover:text-white hover:bg-[#3a4457] rounded-full transition-colors"
					title="Appel vidéo"
				>
					<Video size={18} />
				</button>
				<button
					onClick={() => setShowActions(!showActions)}
					className="p-2 text-gray-400 hover:text-white hover:bg-[#3a4457] rounded-full transition-colors"
					title="Plus d'options"
				>
					<MoreVertical size={18} />
				</button>
			</div>

			{/* Menu d'actions supplémentaires */}
			{showActions && (
				<div className="absolute right-4 top-16 bg-[#3a4457] rounded-md shadow-lg z-10 w-48 py-1">
					<button
						onClick={() => {
							setShowActions(false);
							onViewProfile();
						}}
						className="w-full text-left px-4 py-2 text-white hover:bg-[#4a5467] flex items-center"
					>
						<User size={16} className="mr-2" />
						Voir le profil
					</button>
					<button
						onClick={() => {
							setShowActions(false);
							onRemove();
						}}
						className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#4a5467] flex items-center"
					>
						<X size={16} className="mr-2" />
						Supprimer de mes amis
					</button>
				</div>
			)}
		</div>
	);
}

export default Contacts;
