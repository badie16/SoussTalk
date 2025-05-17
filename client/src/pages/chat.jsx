"use client";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Check, ArrowRight, Phone, Video } from "lucide-react";
import "../index.css";
import ChatDetail from "../components/chat-detail";
import { fetchUsers } from "../services/userService";
import SideNav from "../components/SideNav";

const Chat = () => {
	const navigate = useNavigate();
	// const [profileImage, setProfileImage] = useState("/placeholder.svg");
	const [activeIcon, setActiveIcon] = useState("message-square");
	const [selectedChat, setSelectedChat] = useState(null);
	const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
	const [showChatList, setShowChatList] = useState(true);
	const [currentUserId, setCurrentUserId] = useState("current-user");
	const [contacts, setContacts] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [sidebarView, setSidebarView] = useState("chats"); // "chats" or "friends"

	// Check if user is logged in and load contacts
	useEffect(() => {
		const loadUserAndContacts = async () => {
			setIsLoading(true);
			// Check for user authentication
			const userData = localStorage.getItem("user");
			if (!userData) {
				navigate("/login");
				return;
			}
			try {
				// Parse user data
				const user = JSON.parse(userData);
				// if (user.avatar_url) {
				// 	setProfileImage(user.avatar_url);
				// }
				if (user.id) {
					setCurrentUserId(user.id);
				}

				// Fetch contacts from database
				const userContacts = await fetchUsers();
				setContacts(userContacts);
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserAndContacts();
	}, [navigate]);

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobileView(mobile);
			if (!mobile) {
				setShowChatList(true);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Handle icon click
	const handleIconClick = (iconName) => {
		setActiveIcon(iconName);

		// Toggle sidebar view when clicking users icon
		if (iconName === "users") {
			setSidebarView("friends");
		} else if (iconName === "message-square") {
			setSidebarView("chats");
		}
	};
	// Handle chat selection
	const handleChatSelect = (chat) => {
		setSelectedChat(chat);
		if (isMobileView) {
			setShowChatList(false);
		}
		// Switch back to chats view when selecting a chat from friends view
		if (sidebarView === "friends") {
			setSidebarView("chats");
			setActiveIcon("message-square");
		}
	};
	// Handle back button in mobile view
	const handleBackToList = () => {
		setShowChatList(true);
	};
	// Filter contacts based on search query
	const filteredContacts = contacts.filter((contact) =>
		contact.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900  themed-page overflow-hidden">
			{/* Left navigation sidebar - fixed position */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick}></SideNav>

			{/* Content area - with left margin to account for fixed sidebar */}
			<div className="flex flex-1 ml-[60px]">
				{/* Chat list or Friends list sidebar - conditionally shown on mobile */}
				{(showChatList || !isMobileView) && (
					<div
						className={`${
							isMobileView ? "w-full" : "w-[320px]"
						} overflow-y-auto show-scrollbar-on-hover`}
					>
						<ChatListView
							contacts={filteredContacts}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							isLoading={isLoading}
							selectedChat={selectedChat}
							handleChatSelect={handleChatSelect}
						/>
					</div>
				)}
				{/* Main content area - scrollable */}
				{(!showChatList || !isMobileView) && (
					<div
						className={`${
							isMobileView ? "w-full" : "flex-1"
						} overflow-hidden show-scrollbar-on-hover`}
					>
						{selectedChat ? (
							<ChatDetail
								chat={selectedChat}
								onBack={handleBackToList}
								currentUserId={currentUserId}
							/>
						) : (
							<div className="flex-1 p-6 overflow-y-auto show-scrollbar-on-hover flex items-center justify-center h-full">
								<div className="text-center max-w-md w-full">
									<div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="48"
											height="48"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-green-600"
										>
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
										</svg>
									</div>

									<h1 className="text-2xl font-semibold text-gray-200 mb-4">
										Welcome to SoussTalk Chat App
									</h1>

									<p className="text-gray-400 mb-8">
										Select a chat from the sidebar or start a new conversation
										to begin messaging.
									</p>

									<button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
										Start New Chat
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
};
// Chat List View Component
const ChatListView = ({
	contacts,
	searchQuery,
	setSearchQuery,
	isLoading,
	selectedChat,
	handleChatSelect,
}) => {
	return (
		<div className="h-full bg-gray-100 dark:bg-gray-900  themed-page border-r border-[#2a3447] flex flex-col">
			{/* Header */}
			<div className="p-4 flex justify-between items-center">
				<h1 className="text-xl font-semibold text-white">Chats</h1>
				<button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2a3447] text-gray-300 hover:bg-[#3a4457] transition-colors">
					<Plus size={20} />
				</button>
			</div>

			{/* Search */}
			<div className="px-4 pb-4">
				<div className="relative">
					<input
						type="text"
						placeholder="Search here.."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-[#2a3447] text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none"
					/>
					<Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
				</div>
			</div>

			{/* Chat list content */}
			<div className="flex-1 overflow-y-auto show-scrollbar-on-hover">
				{isLoading ? (
					<div className="flex justify-center items-center h-32">
						<div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : (
					<div>
						{contacts.length > 0 ? (
							contacts.map((contact) => (
								<ChatItem
									key={contact.id}
									contact={contact}
									isSelected={selectedChat?.id === contact.id}
									onClick={() => handleChatSelect(contact)}
								/>
							))
						) : (
							<div className="px-4 py-8 text-center">
								<p className="text-gray-400">
									{searchQuery
										? `No chats found for "${searchQuery}"`
										: "No chats available"}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
// Chat Item Component
function ChatItem({ contact, onClick, isSelected }) {
	// Format message preview
	const getMessagePreview = () => {
		if (contact.isYourMessage) {
			return (
				<div className="flex items-center">
					<span className="text-gray-400 mr-1">You:</span>
					<span className="text-gray-400 truncate">{contact.lastMessage}</span>
				</div>
			);
		} else if (contact.lastMessage) {
			return (
				<span className="text-gray-400 truncate">{contact.lastMessage}</span>
			);
		}
		return null;
	};

	return (
		<div
			className={`flex items-center px-4 py-3 cursor-pointer ${
				isSelected ? "bg-[#2a3447]" : "hover:bg-[#2a3447]"
			}`}
			onClick={onClick}
		>
			{/* User avatar */}
			<div className="relative mr-3">
				{contact.avatar ? (
					<img
						src={contact.avatar || "/placeholder.svg"}
						alt={contact.name}
						className="h-10 w-10 rounded-full object-cover"
					/>
				) : (
					<div
						className={`h-10 w-10 rounded-full flex items-center justify-center ${
							contact.name.includes("Miranda Valentine") ||
							contact.name.includes("Dean Vargas")
								? "bg-purple-100 text-purple-600"
								: contact.name.includes("Zimmerman") ||
								  contact.name.includes("Badie")
								? "bg-gray-100 text-gray-600"
								: "bg-green-100 text-green-600"
						}`}
					>
						<span className="font-medium">{contact.initials}</span>
					</div>
				)}
				{contact.online && (
					<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-[#1a2236]" />
				)}
			</div>

			{/* Message content */}
			<div className="flex-1 min-w-0 pr-2">
				<div className="flex justify-between items-center mb-1">
					<p className="text-sm font-medium text-white truncate">
						{contact.name}
					</p>
					<span className="text-xs text-gray-400 whitespace-nowrap ml-2">
						{contact.date}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex-1 min-w-0">{getMessagePreview()}</div>

					{contact.isYourMessage && (
						<div className="ml-2">
							{contact.status === "read" ? (
								<Check size={16} className="text-blue-500" />
							) : (
								<Check size={16} className="text-gray-500" />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Chat;
