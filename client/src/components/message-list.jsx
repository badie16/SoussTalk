"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import MessageItem from "./message-items";

const MessageList = ({
	messages,
	currentUserId,
	onReply,
	onReact,
	onEdit,
	onDelete,
	onLoadMore,
	hasMore,
	loading,
	conversationId,
	onMarkAsRead,
}) => {
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
	const [newMessageCount, setNewMessageCount] = useState(0);
	const [isUserScrolling, setIsUserScrolling] = useState(false);
	const [lastMessageCount, setLastMessageCount] = useState(0);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [unreadMessageIds, setUnreadMessageIds] = useState(new Set());

	// Auto-scroll to bottom when conversation changes or first load
	useEffect(() => {
		if (conversationId) {
			// Reset states when conversation changes
			setShowNewMessageAlert(false);
			setNewMessageCount(0);
			setIsUserScrolling(false);
			setShowScrollButton(false);
			setIsInitialLoad(true);
			setLastMessageCount(0);
			setUnreadMessageIds(new Set());

			// Scroll to bottom after messages are loaded
			setTimeout(() => {
				scrollToBottom(false);
				setIsInitialLoad(false);
			}, 200);
		}
	}, [conversationId]);

	// Handle new messages - only show alert for unread messages from other users
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container || messages.length === 0) return;

		const newMessagesAdded = messages.length > lastMessageCount;

		if (newMessagesAdded && !isInitialLoad) {
			const newMessages = messages.slice(lastMessageCount);

			// Filter for messages from other users that are not read
			const unreadReceivedMessages = newMessages.filter((msg) => {
				const isFromOtherUser = msg.sender?.id !== currentUserId;
				const isUnread =
					!msg.is_read &&
					!msg.read_by?.some((read) => read.user_id === currentUserId);
				return isFromOtherUser && isUnread;
			});

			setLastMessageCount(messages.length);

			if (unreadReceivedMessages.length > 0) {
				// Add unread message IDs to tracking
				const newUnreadIds = new Set(unreadMessageIds);
				unreadReceivedMessages.forEach((msg) => {
					if (msg.read_at == null) newUnreadIds.add(msg.id);
				});
				setUnreadMessageIds(newUnreadIds);

				const isNearBottom =
					container.scrollHeight -
						container.scrollTop -
						container.clientHeight <
					100;

				if (isNearBottom && !isUserScrolling) {
					// Auto-scroll if user is near bottom and mark as read
					setTimeout(() => {
						scrollToBottom(true);
						markMessagesAsRead(unreadReceivedMessages);
					}, 100);
				} else if (!isNearBottom) {
					// Show new message alert only for unread received messages
					setNewMessageCount((prev) => prev + unreadReceivedMessages.length);
					setShowNewMessageAlert(true);
				}
			} else {
				// For sent messages or already read messages, always scroll to bottom
				const sentMessages = newMessages.filter(
					(msg) => msg.sender?.id === currentUserId
				);
				if (sentMessages.length > 0) {
					setTimeout(() => {
						scrollToBottom(true);
					}, 100);
				}
			}
		} else if (isInitialLoad) {
			setLastMessageCount(messages.length);

			// Check for unread messages on initial load
			const initialUnreadMessages = messages.filter((msg) => {
				const isFromOtherUser = msg.sender?.id !== currentUserId;
				const isUnread =
					!msg.is_read &&
					!msg.read_by?.some((read) => read.user_id === currentUserId);
				return isFromOtherUser && isUnread;
			});

			if (initialUnreadMessages.length > 0) {
				const unreadIds = new Set(initialUnreadMessages.map((msg) => msg.id));
				setUnreadMessageIds(unreadIds);
			}
		}
	}, [
		messages.length,
		lastMessageCount,
		isUserScrolling,
		isInitialLoad,
		currentUserId,
		unreadMessageIds,
	]);

	// Mark messages as read when user scrolls to bottom
	const markMessagesAsRead = useCallback(
		(messagesToMark = null) => {
			const messagesToRead =
				messagesToMark ||
				messages.filter(
					(msg) =>
						unreadMessageIds.has(msg.id) && msg.sender?.id !== currentUserId
				);

			if (messagesToRead.length > 0 && onMarkAsRead) {
				onMarkAsRead(messagesToRead);

				// Remove from unread tracking
				const newUnreadIds = new Set(unreadMessageIds);
				messagesToRead.forEach((msg) => newUnreadIds.delete(msg.id));
				setUnreadMessageIds(newUnreadIds);

				// Update new message count
				setNewMessageCount((prev) => Math.max(0, prev - messagesToRead.length));

				if (newUnreadIds.size === 0) {
					setShowNewMessageAlert(false);
					setNewMessageCount(0);
				}
			}
		},
		[messages, unreadMessageIds, onMarkAsRead, currentUserId]
	);

	// Handle scroll to detect position and load more messages
	const handleScroll = useCallback(
		(e) => {
			const container = e.target;
			const { scrollTop, scrollHeight, clientHeight } = container;

			// Check if user is near bottom (WhatsApp style)
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
			setShowScrollButton(!isNearBottom);

			// Mark messages as read and hide alert if user scrolls to bottom
			if (isNearBottom) {
				if (showNewMessageAlert || unreadMessageIds.size > 0) {
					markMessagesAsRead();
					setShowNewMessageAlert(false);
					setNewMessageCount(0);
				}
			}

			// Detect if user is actively scrolling
			setIsUserScrolling(true);
			clearTimeout(window.scrollTimeout);
			window.scrollTimeout = setTimeout(() => {
				setIsUserScrolling(false);
			}, 150);

			// Load more messages when scrolled to top (like WhatsApp)
			if (scrollTop < 100 && hasMore && !loading) {
				const previousScrollHeight = scrollHeight;
				const previousScrollTop = scrollTop;

				onLoadMore?.().then(() => {
					// Maintain scroll position after loading more messages (WhatsApp behavior)
					setTimeout(() => {
						const newScrollHeight = container.scrollHeight;
						const scrollDifference = newScrollHeight - previousScrollHeight;
						container.scrollTop = previousScrollTop + scrollDifference;
					}, 50);
				});
			}
		},
		[
			hasMore,
			loading,
			onLoadMore,
			showNewMessageAlert,
			unreadMessageIds,
			markMessagesAsRead,
		]
	);

	const scrollToBottom = useCallback(
		(smooth = true) => {
			const container = messagesContainerRef.current;
			if (container) {
				container.scrollTop = container.scrollHeight;
				setShowScrollButton(false);

				// Mark unread messages as read when scrolling to bottom
				if (unreadMessageIds.size > 0) {
					markMessagesAsRead();
				}

				setShowNewMessageAlert(false);
				setNewMessageCount(0);
			}
		},
		[unreadMessageIds, markMessagesAsRead]
	);

	const handleNewMessageClick = () => {
		scrollToBottom(true);
	};

	// Ensure scroll is at bottom when messages change (WhatsApp behavior)
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (container && !isUserScrolling) {
			const isNearBottom =
				container.scrollHeight - container.scrollTop - container.clientHeight <
				100;
			if (isNearBottom || isInitialLoad) {
				scrollToBottom(false);
			}
		}
	}, [messages, isUserScrolling, isInitialLoad, scrollToBottom]);

	// Calculate actual unread count for display
	const actualUnreadCount = unreadMessageIds.size;

	return (
		<div className="flex-1 relative overflow-hidden flex flex-col">
			<div
				ref={messagesContainerRef}
				className="flex-1 overflow-y-auto p-4 scroll-smooth"
				onScroll={handleScroll}
				style={{
					scrollBehavior: "smooth",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Load more indicator at top (WhatsApp style) */}
				{hasMore && (
					<div className="flex justify-center py-2 mb-2">
						{loading ? (
							<div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
								<span className="text-sm">Loading messages...</span>
							</div>
						) : (
							<button
								onClick={() => onLoadMore?.()}
								className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							>
								Load older messages
							</button>
						)}
					</div>
				)}

				{messages.length === 0 && !loading ? (
					<div className="flex items-center justify-center flex-1">
						<div className="text-center">
							<div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
								<svg
									className="w-12 h-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
								No messages yet
							</p>
							<p className="text-gray-400 dark:text-gray-500 text-sm">
								Start the conversation!
							</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col space-y-1">
						{messages.map((message, index) => {
							const isOwn = message.sender?.id === currentUserId;
							const showAvatar =
								!isOwn &&
								(index === messages.length - 1 ||
									messages[index + 1]?.sender?.id !== message.sender?.id);
							const isUnread = unreadMessageIds.has(message.id);

							return (
								<MessageItem
									key={message.id}
									message={message}
									isOwn={isOwn}
									onReply={onReply}
									onReact={onReact}
									onEdit={onEdit}
									onDelete={onDelete}
									showAvatar={showAvatar}
									isUnread={isUnread}
								/>
							);
						})}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* New message alert - only for unread messages from other users */}
			{showNewMessageAlert && actualUnreadCount > 0 && (
				<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
					<button
						onClick={handleNewMessageClick}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-200 animate-pulse"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 14l-7 7m0 0l-7-7m7 7V3"
							/>
						</svg>
						<span className="text-sm font-medium">
							{actualUnreadCount > 1
								? `${actualUnreadCount} new messages`
								: "New message"}
						</span>
					</button>
				</div>
			)}

			{/* Scroll to bottom button */}
			{showScrollButton && !showNewMessageAlert && (
				<button
					onClick={() => scrollToBottom(true)}
					className="absolute bottom-20 right-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
					title="Scroll to bottom"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 14l-7 7m0 0l-7-7m7 7V3"
						/>
					</svg>
					{actualUnreadCount > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
							{actualUnreadCount > 9 ? "9+" : actualUnreadCount}
						</span>
					)}
				</button>
			)}
		</div>
	);
};

export default MessageList;
