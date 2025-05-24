"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Users } from "lucide-react";
import messageService from "../services/messageService";
import GroupCreationModal from "./group-creation-modal";
import FriendsListModal from "./friends-list-modal";

const ChatList = ({ onSelectChat, selectedChatId }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [conversations, setConversations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showFriendsModal, setShowFriendsModal] = useState(false);
	const [showGroupModal, setShowGroupModal] = useState(false);
	const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState([]);

	useEffect(() => {
		loadConversations();

		// Écouter les nouveaux messages et mises à jour
		messageService.on("new_conversation", handleNewConversation);
		messageService.on("new_message", handleNewMessage);
		messageService.on("group_name_updated", handleGroupNameUpdate);

		return () => {
			messageService.off("new_conversation", handleNewConversation);
			messageService.off("new_message", handleNewMessage);
			messageService.off("group_name_updated", handleGroupNameUpdate);
		};
	}, []);

	const loadConversations = async () => {
		try {
			setIsLoading(true);
			const userConversations = await messageService.getUserConversations();
			setConversations(userConversations);
		} catch (error) {
			console.error("Error loading conversations:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewConversation = (conversation) => {
		// Vérifier si la conversation existe déjà
		setConversations((prev) => {
			const existingConv = prev.find((conv) => conv.id === conversation.id);
			if (!existingConv) {
				return [conversation, ...prev];
			}
			return prev;
		});
	};
	const handleNewMessage = (message) => {
		// Mettre à jour la conversation avec le nouveau message
		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === message.conversation_id
					? {
							...conv,
							lastMessage: {
								content: message.content,
								timestamp: message.created_at,
								senderName: message.sender.username,
							},
					  }
					: conv
			)
		);
	};

	const handleGroupNameUpdate = (data) => {
		setConversations((prev) =>
			prev.map((conv) =>
				conv.id === data.conversationId ? { ...conv, name: data.newName } : conv
			)
		);
	};
	const handleCreateGroup = (selectedFriends) => {
		setSelectedFriendsForGroup(selectedFriends);
		setShowGroupModal(true);
	};
	const handleGroupCreated = (group) => {
		setConversations((prev) => [group, ...prev]);
		setShowGroupModal(false);
		setSelectedFriendsForGroup([]);
	};
	const handleStartChat = async (friend) => {
		try {
			// Vérifier si une conversation existe déjà avec cet ami
			const existingConv = conversations.find(
				(conv) => !conv.isGroup && conv.userId === friend.id
			);
			if (existingConv) {
				// Sélectionner la conversation existante
				onSelectChat(existingConv);
				return;
			}
			const conversation = await messageService.createPrivateConversation(
				friend.id
			);

			const chatData = {
				id: conversation.id,
				name: friend.name,
				avatar: friend.avatar_url,
				isGroup: false,
				userId: friend.id,
				online: friend.is_online,
			};

			// Ajouter à la liste des conversations seulement si elle n'existe pas
			setConversations((prev) => {
				const exists = prev.find((conv) => conv.id === chatData.id);
				if (!exists) {
					return [chatData, ...prev];
				}
				return prev;
			});

			// Sélectionner automatiquement la conversation
			onSelectChat(chatData);
		} catch (error) {
			console.error("Error creating conversation:", error);
			if (error.message.includes("already exists")) {
				// Si la conversation existe déjà, recharger la liste
				loadConversations();
			} else {
				alert("Failed to start chat. Please try again.");
			}
		}
	};
	// Filter contacts based on search query
	const filteredConversations = conversations.filter((conv) =>
		conv.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Séparer les groupes et les conversations privées
	const groups = filteredConversations.filter((conv) => conv.isGroup);
	const privateChats = filteredConversations.filter((conv) => !conv.isGroup);

	return (
		<>
			<div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
				{/* Header */}
				<div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
					<h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
						Chats
					</h1>
					<div className="flex space-x-2">
						<button
							onClick={() => setShowGroupModal(true)}
							className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							title="Create Group"
						>
							<Users size={18} />
						</button>
						<button
							className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							onClick={() => setShowFriendsModal(true)}
						>
							<Plus size={18} />
						</button>
					</div>
				</div>

				{/* Search */}
				<div className="p-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Search conversations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-green-500"
						/>
						<Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
					</div>
				</div>

				{/* Conversations List */}
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex justify-center items-center h-32">
							<div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : (
						<>
							{/* Groups */}
							{groups.length > 0 && (
								<div className="px-4 mt-2">
									<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wider">
										GROUPS
									</h2>
									<div className="space-y-1">
										{groups.map((conversation) => (
											<ConversationItem
												key={conversation.id}
												conversation={conversation}
												isSelected={conversation.id === selectedChatId}
												onClick={() => onSelectChat(conversation)}
											/>
										))}
									</div>
								</div>
							)}

							{/* Private Chats */}
							{privateChats.length > 0 && (
								<div className="px-4 mt-6">
									<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wider">
										DIRECT MESSAGES
									</h2>
									<div className="space-y-1">
										{privateChats.map((conversation) => (
											<ConversationItem
												key={conversation.id}
												conversation={conversation}
												isSelected={conversation.id === selectedChatId}
												onClick={() => onSelectChat(conversation)}
											/>
										))}
									</div>
								</div>
							)}

							{/* No results */}
							{filteredConversations.length === 0 && !isLoading && (
								<div className="px-4 py-8 text-center">
									<p className="text-gray-500 dark:text-gray-400">
										{searchQuery
											? `No conversations found for "${searchQuery}"`
											: "No conversations yet"}
									</p>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{/* Group Creation Modal */}
			<GroupCreationModal
				isOpen={showGroupModal}
				onClose={() => {
					setShowGroupModal(false);
					setSelectedFriendsForGroup([]);
				}}
				selectedFriends={selectedFriendsForGroup}
				onGroupCreated={handleGroupCreated}
			/>
			<FriendsListModal
				isOpen={showFriendsModal}
				onClose={() => setShowFriendsModal(false)}
				onStartChat={handleStartChat}
				onCreateGroup={handleCreateGroup}
			/>
		</>
	);
};

function ConversationItem({ conversation, isSelected, onClick }) {
	const formatTime = (timestamp) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now - date) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};

	const getAvatar = () => {
		if (conversation.isGroup) {
			// Avatar par défaut pour les groupes
			return (
				<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
					<Users size={20} className="text-blue-600 dark:text-blue-400" />
				</div>
			);
		} else {
			// Avatar pour les conversations privées
			if (conversation.avatar) {
				return (
					<img
						src={conversation.avatar || "/placeholder.svg"}
						alt={conversation.name}
						className="h-10 w-10 rounded-full object-cover"
					/>
				);
			} else {
				return (
					<div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
						<span className="font-medium text-green-600 dark:text-green-400">
							{conversation.name.charAt(0).toUpperCase()}
						</span>
					</div>
				);
			}
		}
	};

	return (
		<div
			className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
				isSelected
					? "bg-green-50 dark:bg-green-900/20"
					: "hover:bg-gray-100 dark:hover:bg-gray-700"
			}`}
			onClick={onClick}
		>
			{/* Avatar */}
			<div className="relative">
				{getAvatar()}
				{!conversation.isGroup && conversation.online && (
					<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-center mb-1">
					<p
						className={`text-sm font-medium truncate ${
							isSelected
								? "text-green-600 dark:text-green-500"
								: "text-gray-800 dark:text-gray-200"
						}`}
					>
						{conversation.name}
						{conversation.isGroup && conversation.memberCount && (
							<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
								({conversation.memberCount})
							</span>
						)}
					</p>
					{conversation.lastMessage && (
						<span className="text-xs text-gray-400 whitespace-nowrap ml-2">
							{formatTime(conversation.lastMessage.timestamp)}
						</span>
					)}
				</div>
				{conversation.lastMessage && (
					<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
						{conversation.isGroup && conversation.lastMessage.senderName && (
							<span className="font-medium">
								{conversation.lastMessage.senderName}:{" "}
							</span>
						)}
						{conversation.lastMessage.content}
					</p>
				)}
			</div>
		</div>
	);
}

export default ChatList;
