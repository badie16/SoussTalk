"use client";

// Modifier le composant StoryViewer pour naviguer entre toutes les stories d'un utilisateur
// Ajouter ces imports si nécessaires
import { useState, useEffect } from "react";
import {
	ChevronLeft,
	ChevronRight,
	X,
	Heart,
	MessageCircle,
	Send,
} from "lucide-react";
import {
	markStoryAsViewed,
	// reactToStory,
	// replyToStory,
} from "../services/storyService";

// Remplacer le composant StoryViewer par cette version améliorée
const StoryViewer = ({
	story: initialStory,
	onClose,
	stories,
	username,
	currentUserId,
}) => {
	const [currentStory, setCurrentStory] = useState(initialStory);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [userStories, setUserStories] = useState([]);
	const [showReplyInput, setShowReplyInput] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	// Filtrer les stories pour n'avoir que celles de l'utilisateur actuel
	useEffect(() => {
		if (stories && initialStory) {
			const filteredStories = stories.filter(
				(s) => s.user_id === initialStory.user_id
			);
			setUserStories(filteredStories);

			// Trouver l'index de la story initiale
			const index = filteredStories.findIndex((s) => s.id === initialStory.id);
			setCurrentIndex(index >= 0 ? index : 0);
			setCurrentStory(filteredStories[index >= 0 ? index : 0]);
		}
	}, [initialStory, stories]);

	// Gérer la progression automatique
	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					// Passer à la story suivante
					handleNext();
					return 0;
				}
				return prev + 1;
			});
		}, 50); // 5 secondes au total (50ms * 100)

		return () => clearInterval(timer);
	}, [currentIndex, isPaused, userStories.length]);

	// Marquer la story comme vue
	useEffect(() => {
		if (currentStory && currentStory.user_id !== currentUserId) {
			markStoryAsViewed(currentStory.id).catch((error) =>
				console.error("Erreur lors du marquage de la story comme vue:", error)
			);
		}
	}, [currentStory, currentUserId]);

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setCurrentStory(userStories[currentIndex - 1]);
			setProgress(0);
		}
	};

	const handleNext = () => {
		if (currentIndex < userStories.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setCurrentStory(userStories[currentIndex + 1]);
			setProgress(0);
		} else {
			onClose(); // Fermer le visualiseur si c'est la dernière story
		}
	};

	const handleLike = async () => {
		setIsLiked(!isLiked);
		try {
			// await reactToStory(currentStory.id, isLiked ? "unlike" : "like");
		} catch (error) {
			console.error("Erreur lors de la réaction à la story:", error);
		}
	};

	const handleReply = async () => {
		if (!replyText.trim()) return;

		try {
			// await replyToStory(currentStory.id, replyText);
			setReplyText("");
			setShowReplyInput(false);
		} catch (error) {
			console.error("Erreur lors de l'envoi de la réponse:", error);
		}
	};

	if (!currentStory) return null;

	return (
		<div className="relative w-full h-full flex items-center justify-center bg-black">
			{/* Bouton de fermeture */}
			<button
				onClick={onClose}
				className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 rounded-full p-1"
			>
				<X size={24} />
			</button>

			{/* Barre de progression */}
			<div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
				{userStories.map((s, idx) => (
					<div
						key={s.id}
						className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden"
					>
						<div
							className={`h-full bg-white ${
								idx < currentIndex
									? "w-full"
									: idx === currentIndex
									? ""
									: "w-0"
							}`}
							style={{
								width:
									idx === currentIndex
										? `${progress}%`
										: idx < currentIndex
										? "100%"
										: "0%",
							}}
						/>
					</div>
				))}
			</div>

			{/* En-tête avec info utilisateur */}
			<div className="absolute top-6 left-0 right-0 flex items-center px-4 z-10">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3">
						<div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
							{username.charAt(0).toUpperCase()}
						</div>
					</div>
					<div>
						<p className="text-white font-medium">{username}</p>
						<p className="text-xs text-gray-300">
							{new Date(currentStory.created_at).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<div
				className="absolute left-0 top-0 bottom-0 w-1/5 z-10 flex items-center justify-start"
				onClick={handlePrevious}
			>
				{currentIndex > 0 && (
					<ChevronLeft size={36} className="text-white ml-2" />
				)}
			</div>

			<div
				className="absolute right-0 top-0 bottom-0 w-1/5 z-10 flex items-center justify-end"
				onClick={handleNext}
			>
				{currentIndex < userStories.length - 1 && (
					<ChevronRight size={36} className="text-white mr-2" />
				)}
			</div>

			{/* Contenu de la story */}
			<div
				className="w-full h-full flex items-center justify-center"
				onClick={() => setIsPaused(!isPaused)}
			>
				{currentStory.type === "text" ? (
					<div
						className={`w-full h-full flex items-center justify-center ${
							currentStory.background ||
							"bg-gradient-to-r from-purple-500 to-pink-500"
						}`}
					>
						<p className="text-white text-2xl font-bold text-center p-8 max-w-lg">
							{currentStory.caption}
						</p>
					</div>
				) : currentStory.type === "video" ? (
					<video
						src={currentStory.media_url}
						className="max-h-full max-w-full object-contain"
						autoPlay
						loop
						muted
					/>
				) : (
					<img
						src={currentStory.media_url || "/placeholder.svg"}
						alt="Story"
						className="max-h-full max-w-full object-contain"
					/>
				)}
			</div>

			{/* Actions en bas */}
			{currentStory.user_id !== currentUserId && (
				<div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
					<button
						className={`p-3 rounded-full ${
							isLiked ? "bg-red-500" : "bg-gray-800"
						} text-white`}
						onClick={handleLike}
					>
						<Heart size={24} fill={isLiked ? "white" : "none"} />
					</button>

					<button
						className="p-3 rounded-full bg-gray-800 text-white"
						onClick={() => setShowReplyInput(!showReplyInput)}
					>
						<MessageCircle size={24} />
					</button>
				</div>
			)}

			{/* Champ de réponse */}
			{showReplyInput && (
				<div className="absolute bottom-16 left-4 right-4 bg-gray-800 rounded-full flex items-center p-1 z-20">
					<input
						type="text"
						className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none"
						placeholder="Répondre à cette story..."
						value={replyText}
						onChange={(e) => setReplyText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleReply()}
					/>
					<button
						className="p-2 rounded-full bg-green-600 text-white"
						onClick={handleReply}
					>
						<Send size={20} />
					</button>
				</div>
			)}
		</div>
	);
};

export default StoryViewer;
