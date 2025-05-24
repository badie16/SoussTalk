"use client";

import { useRef, useEffect, useState } from "react";
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
}) => {
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const [showScrollButton, setShowScrollButton] = useState(false);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (container) {
			const isNearBottom =
				container.scrollHeight - container.scrollTop - container.clientHeight <
				100;
			if (isNearBottom) {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			} else {
				setShowScrollButton(true);
			}
		}
	}, [messages]);

	// Handle scroll to detect when to load more messages
	const handleScroll = (e) => {
		const container = e.target;
		const isNearBottom =
			container.scrollHeight - container.scrollTop - container.clientHeight <
			100;

		setShowScrollButton(!isNearBottom);

		// Load more messages when scrolled to top
		if (container.scrollTop === 0 && hasMore && !loading) {
			onLoadMore?.();
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		setShowScrollButton(false);
	};

	return (
		<div className="flex-1 relative overflow-auto">
			<div
				ref={messagesContainerRef}
				className="h-full overflow-y-auto  p-4"
				onScroll={handleScroll}
			>
				{/* Loading indicator for older messages */}
				{loading && (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
					</div>
				)}

				{messages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
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
					<>
						{messages.map((message) => (
							<MessageItem
								key={message.id}
								message={message}
								isOwn={message.sender?.id === currentUserId}
								onReply={onReply}
								onReact={onReact}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
						<div ref={messagesEndRef} />
					</>
				)}
			</div>

			{/* Scroll to bottom button */}
			{showScrollButton && (
				<button
					onClick={scrollToBottom}
					className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200"
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
				</button>
			)}
		</div>
	);
};

export default MessageList;
