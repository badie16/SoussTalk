"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatDetail from "../components/chat-detail";
import ChatList from "../components/chat-list";
import SideNav from "../components/SideNav";
import messageService from "../services/messageService";
import { getCurrentUser } from "../services/authService";

const Chat = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [activeIcon, setActiveIcon] = useState("message-square");
	const [selectedChat, setSelectedChat] = useState(null);
	const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
	const [showChatList, setShowChatList] = useState(true);
	const [currentUser, setCurrentUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check if user is logged in and initialize
	useEffect(() => {
		const initializeApp = async () => {
			try {
				setIsLoading(true);

				// Check authentication
				const user = getCurrentUser();
				if (!user) {
					navigate("/login");
					return;
				}

				setCurrentUser(user);

				// Initialize message service
				const token = localStorage.getItem("token");
        console.log(token)
				if (token) {
					messageService.initializeSocket(token);

					// Join user conversations
					setTimeout(() => {
						messageService.socket?.emit("join_user_conversations");
					}, 1000);
				}

				// Handle navigation state
				if (location.state?.selectedContact) {
					const contact = location.state.selectedContact;

					// Create or get conversation
					if (!contact.conversationId) {
						try {
							const conversation =
								await messageService.createPrivateConversation(contact.id);
							setSelectedChat({
								id: conversation.id,
								name: contact.name,
								avatar: contact.avatar,
								isGroup: false,
								userId: contact.id,
								online: contact.online,
							});
						} catch (error) {
							console.error("Error creating conversation:", error);
						}
					} else {
						setSelectedChat(contact);
					}

					if (isMobileView) {
						setShowChatList(false);
					}

					// Clear navigation state
					window.history.replaceState({}, document.title);
				}
			} catch (error) {
				console.error("Error initializing app:", error);
				navigate("/login");
			} finally {
				setIsLoading(false);
			}
		};

		initializeApp();

		// Cleanup on unmount
		return () => {
			messageService.disconnect();
		};
	}, [navigate, location.state, isMobileView]);

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

		// Navigate to different pages based on icon
		switch (iconName) {
			case "phone":
				navigate("/calls");
				break;
			case "users":
				navigate("/contacts");
				break;
			case "user":
				navigate("/profile");
				break;
			case "settings":
				navigate("/settings");
				break;
			default:
				// Stay on chat page
				break;
		}
	};

	// Handle chat selection
	const handleChatSelect = (chat) => {
		setSelectedChat(chat);
		if (isMobileView) {
			setShowChatList(false);
		}
	};

	// Handle back button in mobile view
	const handleBackToList = () => {
		setShowChatList(true);
		setSelectedChat(null);
	};

	if (isLoading) {
		return (
			<div className="flex h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900 themed-page overflow-hidden">
			{/* Left navigation sidebar */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />

			{/* Content area */}
			<div className="flex flex-1 ml-[60px]">
				{/* Chat list sidebar */}
				{(showChatList || !isMobileView) && (
					<div
						className={`${
							isMobileView ? "w-full" : "w-[320px]"
						} overflow-y-auto show-scrollbar-on-hover`}
					>
						<ChatList
							onSelectChat={handleChatSelect}
							selectedChatId={selectedChat?.id}
						/>
					</div>
				)}

				{/* Main chat area */}
				{(!showChatList || !isMobileView) && (
					<div
						className={`${
							isMobileView ? "w-full" : "flex-1"
						} overflow-hidden show-scrollbar-on-hover`}
					>
						<ChatDetail
							chat={selectedChat}
							onBack={handleBackToList}
							currentUserId={currentUser?.id}
						/>
					</div>
				)}
			</div>
		</main>
	);
};

export default Chat;
