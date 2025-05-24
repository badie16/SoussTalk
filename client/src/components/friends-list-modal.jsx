"use client";

import { useState, useEffect } from "react";
import { X, Search, MessageCircle, Users } from "lucide-react";
import { getFriends } from "../services/friendService";

const FriendsListModal = ({ isOpen, onClose, onStartChat, onCreateGroup }) => {
	const [friends, setFriends] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFriends, setSelectedFriends] = useState([]);
	const [mode, setMode] = useState("chat"); // "chat" or "group"

	useEffect(() => {
		if (isOpen) {
			loadFriends();
		}
	}, [isOpen]);

	const loadFriends = async () => {
		try {
			setIsLoading(true);
			const users = (await getFriends()).data;
            console.log(users)
			const formatted = users.map((user) => ({
				...user,
				first_name: user.name?.split(" ")[0] || "",
				last_name: user.name?.split(" ").slice(1).join(" ") || "",
				avatar_url: user.avatar || "",
				is_online: false, // si ce champ est utile
			}));
			setFriends(formatted);
		} catch (error) {
			console.error("Error loading friends:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredFriends = friends.filter((friend) =>
		friend.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleFriendSelect = (friend) => {
		if (mode === "chat") {
			onStartChat(friend);
			onClose();
		} else {
			setSelectedFriends((prev) => {
				const isSelected = prev.find((f) => f.id === friend.id);
				if (isSelected) {
					return prev.filter((f) => f.id !== friend.id);
				} else {
					return [...prev, friend];
				}
			});
		}
	};

	const handleCreateGroup = () => {
		if (selectedFriends.length > 0) {
			onCreateGroup(selectedFriends);
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{mode === "chat" ? "Start New Chat" : "Create Group"}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
					>
						<X size={20} className="text-gray-500 dark:text-gray-400" />
					</button>
				</div>

				{/* Mode Toggle */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
						<button
							onClick={() => {
								setMode("chat");
								setSelectedFriends([]);
							}}
							className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
								mode === "chat"
									? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
									: "text-gray-600 dark:text-gray-400"
							}`}
						>
							<MessageCircle size={16} className="mr-2" />
							Start Chat
						</button>
						<button
							onClick={() => {
								setMode("group");
								setSelectedFriends([]);
							}}
							className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
								mode === "group"
									? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
									: "text-gray-600 dark:text-gray-400"
							}`}
						>
							<Users size={16} className="mr-2" />
							Create Group
						</button>
					</div>
				</div>

				{/* Search */}
				<div className="p-4">
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
							size={16}
						/>
						<input
							type="text"
							placeholder="Search friends..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
				</div>

				{/* Friends List */}
				<div className="flex-1 overflow-y-auto px-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : filteredFriends.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500 dark:text-gray-400">
								{searchQuery ? "No friends found" : "No friends available"}
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{filteredFriends.map((friend) => {
								const isSelected = selectedFriends.find(
									(f) => f.id === friend.id
								);
								return (
									<div
										key={friend.id}
										onClick={() => handleFriendSelect(friend)}
										className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
											mode === "group" && isSelected
												? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
												: "hover:bg-gray-100 dark:hover:bg-gray-700"
										}`}
									>
										<div className="relative">
											{friend.avatar_url ? (
												<img
													src={friend.avatar_url || "/placeholder.svg"}
													alt={friend.name}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : (
												<div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
													<span className="font-medium text-green-600 dark:text-green-400">
														{friend.name.charAt(0).toUpperCase()}
													</span>
												</div>
											)}
											{friend.is_online && (
												<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
											)}
										</div>
										<div className="ml-3 flex-1">
											<p className="font-medium text-gray-900 dark:text-gray-100">
												{friend.name}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{friend.is_online ? "Online" : "Offline"}
											</p>
										</div>
										{mode === "group" && isSelected && (
											<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
												<svg
													className="w-3 h-3 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				{mode === "group" && (
					<div className="p-4 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={handleCreateGroup}
							disabled={selectedFriends.length === 0}
							className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
								selectedFriends.length > 0
									? "bg-green-600 hover:bg-green-700 text-white"
									: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
							}`}
						>
							Create Group ({selectedFriends.length} selected)
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FriendsListModal;
