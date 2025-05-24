"use client";

import {
	Check,
	CheckCheck,
	Reply,
	Smile,
	Edit,
	Trash2,
	Download,
} from "lucide-react";
import { useState } from "react";

const MessageItem = ({
	message,
	isOwn,
	onReply,
	onReact,
	onEdit,
	onDelete,
}) => {
	const [showActions, setShowActions] = useState(false);
	const [showReactions, setShowReactions] = useState(false);

	// Format the timestamp
	const formattedTime = message.timestamp
		? new Date(message.timestamp).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
		  })
		: "";

	const reactions = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎"];

	const handleReaction = (emoji) => {
		onReact(message.id, emoji);
		setShowReactions(false);
	};
  const [isPlaying, setIsPlaying] = useState(false);

	const toggleAudio = () => {
		const audio = document.getElementById(`audio-${message.id}`);
		if (audio.paused) {
			audio.play();
			setIsPlaying(true);
			audio.onended = () => setIsPlaying(false);
		} else {
			audio.pause();
			setIsPlaying(false);
		}
	};

	const renderFileContent = () => {
		if (!message.file_url) return null;

		const fileType = message.message_type;
		const fileName = message.file_name || "File";

		switch (fileType) {
			case "image":
				return (
					<div className="mt-2">
						<img
							src={message.file_url || "/placeholder.svg"}
							alt={fileName}
							className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
							onClick={() => window.open(message.file_url, "_blank")}
						/>
					</div>
				);

			case "video":
				return (
					<div className="mt-2">
						<video
							controls
							className="max-w-xs rounded-lg"
							src={message.file_url}
						/>
					</div>
				);

			case "audio":
				return (
					<div className="mt-2 flex items-center gap-3 bg-gray-100 dark:bg-gray-800 border-green-500 border-2 px-4 py-2 rounded-2xl shadow-md w-fit max-w-xs">
						<button
							onClick={toggleAudio}
							className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition"
						>
							{isPlaying ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-5 h-5"
								>
									<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-5 h-5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5.25 5.25l13.5 6.75-13.5 6.75V5.25z"
									/>
								</svg>
							)}
						</button>

						<span className="text-sm text-gray-700 dark:text-gray-200">
							Audio message
						</span>

						<audio
							id={`audio-${message.id}`}
							src={message.file_url}
							className="hidden"
						/>
					</div>
				);

			default:
				return (
					<div className="mt-2 flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg max-w-xs">
						<div className="flex-1">
							<p className="text-sm font-medium">{fileName}</p>
							<p className="text-xs text-gray-500">File</p>
						</div>
						<button
							onClick={() => window.open(message.file_url, "_blank")}
							className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
						>
							<Download size={16} />
						</button>
					</div>
				);
		}
	};

	return (
		<div
			className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"} group`}
		>
			<div
				className={`flex flex-col ${
					isOwn ? "items-end" : "items-start"
				} max-w-[70%] relative`}
			>
				{/* Sender name - only show for others' messages */}
				{!isOwn && (
					<span className="text-xs text-gray-500 mb-1 font-medium">
						{message.sender?.username || message.sender?.name}
					</span>
				)}

				{/* Reply preview */}
				{message.reply_to && (
					<div className="mb-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg border-l-4 border-blue-500 max-w-full">
						<p className="text-xs text-gray-600 dark:text-gray-400">
							{message.reply_to.sender?.username}
						</p>
						<p className="text-sm text-gray-800 dark:text-gray-200 truncate">
							{message.reply_to.content}
						</p>
					</div>
				)}

				{/* Message content bubble (only for text) */}
				{message.content && (
					<div
						className={`rounded-lg px-4 py-2 inline-block relative ${
							isOwn
								? "bg-green-500 text-white rounded-tr-none"
								: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
						}`}
						onMouseEnter={() => setShowActions(true)}
						onMouseLeave={() => setShowActions(false)}
					>
						<p className="whitespace-pre-wrap break-words">{message.content}</p>

						{message.edited_at && (
							<span className="text-xs opacity-70 italic ml-2">(edited)</span>
						)}

						{/* Message actions */}
						{showActions && (
							<div
								className={`absolute top-0 ${
									isOwn
										? "left-0 -translate-x-full"
										: "right-0 translate-x-full"
								} flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1`}
							>
								<button onClick={() => onReply(message)} title="Reply">
									<Reply size={14} />
								</button>
								<button
									onClick={() => setShowReactions(!showReactions)}
									title="React"
								>
									<Smile size={14} />
								</button>
								{isOwn && (
									<>
										<button onClick={() => onEdit(message)} title="Edit">
											<Edit size={14} />
										</button>
										<button
											onClick={() => onDelete(message.id)}
											className="text-red-500"
											title="Delete"
										>
											<Trash2 size={14} />
										</button>
									</>
								)}
							</div>
						)}

						{/* Reactions picker */}
						{showReactions && (
							<div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
								{reactions.map((emoji) => (
									<button
										key={emoji}
										onClick={() => handleReaction(emoji)}
										className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
									>
										{emoji}
									</button>
								))}
							</div>
						)}
					</div>
				)}

				{/* File content (rendered separately below text bubble) */}
				{renderFileContent()}

				{/* Message reactions */}
				{message.reactions && message.reactions.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-1">
						{message.reactions
							.reduce((acc, reaction) => {
								const existing = acc.find((r) => r.emoji === reaction.emoji);
								if (existing) {
									existing.count++;
									existing.users.push(reaction.user.username);
								} else {
									acc.push({
										emoji: reaction.emoji,
										count: 1,
										users: [reaction.user.username],
									});
								}
								return acc;
							}, [])
							.map((reaction, index) => (
								<button
									key={index}
									onClick={() => handleReaction(reaction.emoji)}
									className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-500"
									title={reaction.users.join(", ")}
								>
									<span>{reaction.emoji}</span>
									<span>{reaction.count}</span>
								</button>
							))}
					</div>
				)}

				{/* Message info */}
				<div className="flex items-center mt-1 text-xs text-gray-500">
					{/* Time */}
					<span>{formattedTime}</span>

					{/* Status indicators - only for own messages */}
					{isOwn && (
						<div className="flex items-center ml-2">
							{message.read_at ? (
								<CheckCheck size={14} className="text-blue-500" />
							) : message.delivered_at ? (
								<CheckCheck size={14} className="text-gray-500" />
							) : (
								<Check size={14} className="text-gray-400" />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MessageItem;
