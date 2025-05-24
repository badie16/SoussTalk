"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check } from "lucide-react";
import { getFriends } from "../services/friendService";
import messageService from "../services/messageService";

const GroupCreationModal = ({ isOpen, onClose, onGroupCreated }) => {
	const [groupName, setGroupName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [availableUsers, setAvailableUsers] = useState([]);
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		if (isOpen) {
			loadUsers();
		}
	}, [isOpen]);

	const loadUsers = async () => {
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
			setAvailableUsers(formatted);
		} catch (error) {
			console.error("Error loading users:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredUsers = Array.isArray(availableUsers)
		? availableUsers.filter((user) => {
				const fullName = user.name || "";
				const username = user.username || "";
				return (
					username.toLowerCase().includes(searchQuery.toLowerCase()) ||
					fullName.toLowerCase().includes(searchQuery.toLowerCase())
				);
		  })
		: [];

	const toggleMemberSelection = (user) => {
		setSelectedMembers((prev) => {
			const isSelected = prev.find((member) => member.id === user.id);
			if (isSelected) {
				return prev.filter((member) => member.id !== user.id);
			} else {
				return [...prev, user];
			}
		});
	};

	const handleCreateGroup = async () => {
		if (!groupName.trim() || selectedMembers.length === 0) {
			return;
		}

		try {
			setIsCreating(true);
			const memberIds = selectedMembers.map((member) => member.id);
			const group = await messageService.createGroup(
				groupName.trim(),
				memberIds
			);

			onGroupCreated(group);
			handleClose();
		} catch (error) {
			console.error("Error creating group:", error);
			alert("Failed to create group. Please try again.");
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		setGroupName("");
		setSearchQuery("");
		setSelectedMembers([]);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
						Create New Group
					</h2>
					<button
						onClick={handleClose}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
					>
						<X size={20} />
					</button>
				</div>

				{/* Group Name Input */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<input
						type="text"
						placeholder="Group name"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
						maxLength={50}
					/>
				</div>

				{/* Search Members */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700">
					<div className="relative">
						<input
							type="text"
							placeholder="Search users..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
						<Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
					</div>
				</div>

				{/* Selected Members */}
				{selectedMembers.length > 0 && (
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							Selected members ({selectedMembers.length})
						</p>
						<div className="flex flex-wrap gap-2">
							{selectedMembers.map((member) => (
								<div
									key={member.id}
									className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm"
								>
									<span>{member.username}</span>
									<button
										onClick={() => toggleMemberSelection(member)}
										className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
									>
										<X size={14} />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* User List */}
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex justify-center items-center h-32">
							<div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					) : (
						<div className="p-4">
							{filteredUsers.length === 0 ? (
								<p className="text-center text-gray-500 dark:text-gray-400">
									No users found
								</p>
							) : (
								<div className="space-y-2">
									{filteredUsers.map((user) => {
										const isSelected = selectedMembers.find(
											(member) => member.id === user.id
										);
										return (
											<div
												key={user.id}
												onClick={() => toggleMemberSelection(user)}
												className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
													isSelected
														? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
														: "hover:bg-gray-50 dark:hover:bg-gray-700"
												}`}
											>
												<div className="relative mr-3">
													{user.avatar_url ? (
														<img
															src={user.avatar_url || "/placeholder.svg"}
															alt={user.username}
															className="w-10 h-10 rounded-full object-cover"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
															<span className="text-green-600 dark:text-green-400 font-medium">
																{user.username.charAt(0).toUpperCase()}
															</span>
														</div>
													)}
													{user.is_online && (
														<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
													)}
												</div>
												<div className="flex-1">
													<p className="font-medium text-gray-800 dark:text-gray-200">
														{user.username}
													</p>
													{user.first_name && (
														<p className="text-sm text-gray-500 dark:text-gray-400">
															{user.first_name} {user.last_name}
														</p>
													)}
												</div>
												{isSelected && (
													<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
														<Check size={16} className="text-white" />
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
					<button
						onClick={handleClose}
						className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleCreateGroup}
						disabled={
							!groupName.trim() || selectedMembers.length === 0 || isCreating
						}
						className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
					>
						{isCreating ? (
							<>
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
								Creating...
							</>
						) : (
							<>
								<Plus size={16} className="mr-2" />
								Create Group
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default GroupCreationModal;
