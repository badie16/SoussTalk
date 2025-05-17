"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search,
	UserPlus,
	X,
	Check,
	Users,
	UserCheck,
	Bell,
} from "lucide-react";
import {
	// searchUsers,
	getSuggestedFriends,
	getFriendRequests,
	sendFriendRequest,
	cancelFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
} from "../services/friendService";
import SideNav from "../components/SideNav";

const FindFriends = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [suggestedFriends, setSuggestedFriends] = useState([]);
	const [friendRequests, setFriendRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [activeCategory, setActiveCategory] = useState("suggested");
	const [activeIcon, setActiveIcon] = useState("users-search");

	// Charger les données utilisateur, les suggestions d'amis et les demandes
	useEffect(() => {
		const loadUserData = async () => {
			setIsLoading(true);

			// Vérifier l'authentification
			const userData = localStorage.getItem("user");
			if (!userData) {
				navigate("/login");
				return;
			}

			try {
				// Charger les suggestions d'amis
				const suggestions = await getSuggestedFriends();
				setSuggestedFriends(suggestions);

				// Charger les demandes d'amitié
				const requests = await getFriendRequests();
				setFriendRequests(requests);
			} catch (error) {
				console.error("Erreur lors du chargement des données:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserData();
	}, [navigate]);

	// Gérer la recherche d'utilisateurs
	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		setSearchLoading(true);
		try {
			// const results = await searchUsers(searchQuery);
			setSearchResults([]);
			setActiveCategory("search");
		} catch (error) {
			console.error("Erreur lors de la recherche:", error);
		} finally {
			setSearchLoading(false);
		}
	};

	// Gérer l'envoi d'une demande d'ami
	const handleSendRequest = async (userId) => {
		try {
			await sendFriendRequest(userId);

			// Mettre à jour l'état local pour refléter la demande envoyée
			if (activeCategory === "suggested") {
				setSuggestedFriends(
					suggestedFriends.map((user) =>
						user.id === userId ? { ...user, requestSent: true } : user
					)
				);
			} else if (activeCategory === "search") {
				setSearchResults(
					searchResults.map((user) =>
						user.id === userId ? { ...user, requestSent: true } : user
					)
				);
			}
		} catch (error) {
			console.error("Erreur lors de l'envoi de la demande d'ami:", error);
		}
	};

	// Gérer l'annulation d'une demande d'ami
	const handleCancelRequest = async (userId) => {
		try {
			await cancelFriendRequest(userId);

			// Mettre à jour l'état local pour refléter l'annulation
			if (activeCategory === "suggested") {
				setSuggestedFriends(
					suggestedFriends.map((user) =>
						user.id === userId ? { ...user, requestSent: false } : user
					)
				);
			} else if (activeCategory === "search") {
				setSearchResults(
					searchResults.map((user) =>
						user.id === userId ? { ...user, requestSent: false } : user
					)
				);
			}
		} catch (error) {
			console.error("Erreur lors de l'annulation de la demande d'ami:", error);
		}
	};

	// Gérer l'acceptation d'une demande d'ami
	const handleAcceptRequest = async (userId) => {
		try {
			await acceptFriendRequest(userId);
			// Retirer la demande de la liste
			setFriendRequests(
				friendRequests.filter((request) => request.id !== userId)
			);
		} catch (error) {
			console.error("Erreur lors de l'acceptation de la demande d'ami:", error);
		}
	};

	// Gérer le rejet d'une demande d'ami
	const handleRejectRequest = async (userId) => {
		try {
			await rejectFriendRequest(userId);
			// Retirer la demande de la liste
			setFriendRequests(
				friendRequests.filter((request) => request.id !== userId)
			);
		} catch (error) {
			console.error("Erreur lors du rejet de la demande d'ami:", error);
		}
	};

	// Gérer le clic sur une icône
	const handleIconClick = (iconName) => {
		setActiveIcon(iconName);
	};

	// Déterminer le contenu à afficher en fonction de la catégorie active
	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="flex justify-center items-center h-32">
					<div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			);
		}

		switch (activeCategory) {
			case "suggested":
				return (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* {suggestedFriends.length > 0 ? (
							suggestedFriends.map((user) => (
								<UserCard
									key={user.id}
									user={user}
									onSendRequest={() => handleSendRequest(user.id)}
									onCancelRequest={() => handleCancelRequest(user.id)}
								/>
							))
						) : ( */}
							<div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
								<Users size={48} className="text-gray-500 mb-4" />
								<p className="text-gray-400 mb-2">
									Aucune suggestion pour le moment
								</p>
								<p className="text-gray-500 text-sm">
									Essayez de rechercher des amis par nom d'utilisateur
								</p>
							</div>
						{/* )} */}
					</div>
				);
			case "requests":
				return (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{friendRequests.length > 0 ? (
							friendRequests.map((request) => (
								<RequestCard
									key={request.id}
									request={request}
									onAccept={() => handleAcceptRequest(request.id)}
									onReject={() => handleRejectRequest(request.id)}
								/>
							))
						) : (
							<div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
								<Bell size={48} className="text-gray-500 mb-4" />
								<p className="text-gray-400 mb-2">
									Aucune demande d'amitié en attente
								</p>
								<p className="text-gray-500 text-sm">
									Les demandes d'amitié apparaîtront ici
								</p>
							</div>
						)}
					</div>
				);
			case "search":
				return (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{searchResults.length > 0 ? (
							searchResults.map((user) => (
								<UserCard
									key={user.id}
									user={user}
									onSendRequest={() => handleSendRequest(user.id)}
									onCancelRequest={() => handleCancelRequest(user.id)}
								/>
							))
						) : (
							<div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
								<Search size={48} className="text-gray-500 mb-4" />
								<p className="text-gray-400 mb-2">Aucun résultat trouvé</p>
								<p className="text-gray-500 text-sm">
									Essayez avec un autre nom d'utilisateur
								</p>
							</div>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900  themed-page overflow-hidden">
			{/* Barre latérale de navigation */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />

			{/* Zone de contenu - avec marge gauche pour tenir compte de la barre latérale fixe */}
			<div className="flex flex-1 ml-[60px]">
				<div className="w-full max-w-5xl mx-auto px-4 py-6">
					<div className="flex flex-col h-full">
						{/* En-tête */}
						<div className="mb-6">
							<h1 className="text-2xl font-bold text-white mb-2">
								Trouver des amis
							</h1>
							<p className="text-gray-400">
								Connectez-vous avec des personnes que vous connaissez peut-être
							</p>
						</div>

						{/* Barre de recherche */}
						<div className="mb-6">
							<div className="relative">
								<input
									type="text"
									placeholder="Rechercher par nom d'utilisateur..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSearch()}
									className="w-full bg-white dark:bg-gray-800 shadow-sm  text-gray-200 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<button
									onClick={handleSearch}
									disabled={searchLoading}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
								>
									{searchLoading ? (
										<div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
									) : (
										<Search size={20} />
									)}
								</button>
							</div>
						</div>

						{/* Catégories */}
						<div className="flex mb-6 border-b border-[#333333]">
							<button
								onClick={() => setActiveCategory("suggested")}
								className={`py-2 px-4 font-medium ${
									activeCategory === "suggested"
										? "text-green-500 border-b-2 border-green-500"
										: "text-gray-400 hover:text-gray-200"
								}`}
							>
								Suggestions
							</button>
							<button
								onClick={() => setActiveCategory("requests")}
								className={`py-2 px-4 font-medium flex items-center ${
									activeCategory === "requests"
										? "text-green-500 border-b-2 border-green-500"
										: "text-gray-400 hover:text-gray-200"
								}`}
							>
								Demandes
								{friendRequests.length > 0 && (
									<span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{friendRequests.length}
									</span>
								)}
							</button>
							{searchResults.length > 0 && (
								<button
									onClick={() => setActiveCategory("search")}
									className={`py-2 px-4 font-medium ${
										activeCategory === "search"
											? "text-green-500 border-b-2 border-green-500"
											: "text-gray-400 hover:text-gray-200"
									}`}
								>
									Résultats de recherche
								</button>
							)}
						</div>

						{/* Contenu principal */}
						<div className="flex-1 overflow-y-auto">{renderContent()}</div>
					</div>
				</div>
			</div>
		</main>
	);
};

// Composant de carte utilisateur
const UserCard = ({ user, onSendRequest, onCancelRequest }) => {
	return (
		<div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
			<div className="h-24 bg-gradient-to-r from-green-600 to-green-500"></div>
			<div className="px-4 pt-0 pb-4 relative">
				<div className="flex justify-center">
					<div className="w-20 h-20 rounded-full border-4 border-[#1e1e1e] overflow-hidden -mt-10 bg-[#2a2a2a]">
						{user.avatar ? (
							<img
								src={user.avatar || "/placeholder.svg"}
								alt={user.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-xl font-bold">
								{user.initials || user.name.charAt(0)}
							</div>
						)}
					</div>
				</div>

				<div className="text-center mt-2">
					<h3 className="text-white font-bold text-lg">{user.name}</h3>
					<p className="text-gray-400 text-sm">@{user.username}</p>

					{user.mutualFriends > 0 && (
						<p className="text-gray-500 text-xs mt-1">
							<UserCheck size={12} className="inline mr-1" />
							{user.mutualFriends} ami{user.mutualFriends > 1 ? "s" : ""} en
							commun
						</p>
					)}
				</div>

				<div className="mt-4 flex justify-center">
					{user.isFriend ? (
						<button className="px-4 py-2 bg-[#333333] text-white rounded-full text-sm font-medium flex items-center">
							<UserCheck size={16} className="mr-2" />
							Ami
						</button>
					) : user.requestSent ? (
						<button
							onClick={onCancelRequest}
							className="px-4 py-2 bg-[#333333] text-gray-300 rounded-full text-sm font-medium flex items-center hover:bg-[#444444] transition-colors"
						>
							<X size={16} className="mr-2" />
							Annuler la demande
						</button>
					) : user.requestReceived ? (
						<div className="flex space-x-2">
							<button className="px-3 py-2 bg-green-600 text-white rounded-full text-sm font-medium flex items-center hover:bg-green-700 transition-colors">
								<Check size={16} className="mr-1" />
								Accepter
							</button>
							<button className="px-3 py-2 bg-[#333333] text-gray-300 rounded-full text-sm font-medium flex items-center hover:bg-[#444444] transition-colors">
								<X size={16} className="mr-1" />
								Refuser
							</button>
						</div>
					) : (
						<button
							onClick={onSendRequest}
							className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium flex items-center hover:bg-green-700 transition-colors"
						>
							<UserPlus size={16} className="mr-2" />
							Ajouter
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

// Composant de carte de demande d'amitié
const RequestCard = ({ request, onAccept, onReject }) => {
	return (
		<div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
			<div className="h-24 bg-gradient-to-r from-green-600 to-green-500"></div>
			<div className="px-4 pt-0 pb-4 relative">
				<div className="flex justify-center">
					<div className="w-20 h-20 rounded-full border-4 border-[#1e1e1e] overflow-hidden -mt-10 bg-[#2a2a2a]">
						{request.avatar ? (
							<img
								src={request.avatar || "/placeholder.svg"}
								alt={request.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-xl font-bold">
								{request.initials || request.name.charAt(0)}
							</div>
						)}
					</div>
				</div>

				<div className="text-center mt-2">
					<h3 className="text-white font-bold text-lg">{request.name}</h3>
					<p className="text-gray-400 text-sm">@{request.username}</p>
					<p className="text-gray-500 text-xs mt-2">
						Demande envoyée {request.timeAgo || "récemment"}
					</p>
				</div>

				<div className="mt-4 flex justify-center space-x-2">
					<button
						onClick={onAccept}
						className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium flex items-center hover:bg-green-700 transition-colors"
					>
						<Check size={16} className="mr-2" />
						Accepter
					</button>
					<button
						onClick={onReject}
						className="px-4 py-2 bg-[#333333] text-gray-300 rounded-full text-sm font-medium flex items-center hover:bg-[#444444] transition-colors"
					>
						<X size={16} className="mr-2" />
						Refuser
					</button>
				</div>
			</div>
		</div>
	);
};

export default FindFriends;
