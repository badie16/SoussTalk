"use client";

import { useState, useRef, useEffect } from "react";
import {
	Send,
	Paperclip,
	Smile,
	Mic,
	X,
	File,
	ImageIcon,
	Play,
	Pause,
	Trash2,
} from "lucide-react";

const MessageInput = ({ onSendMessage, replyTo, onCancelReply, onTyping }) => {
	const [message, setMessage] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showFileOptions, setShowFileOptions] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);

	const inputRef = useRef(null);
	const fileInputRef = useRef(null);
	const imageInputRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const recordingIntervalRef = useRef(null);
	const audioRef = useRef(null);

	// Emojis organisés par catégories comme WhatsApp
	const emojiCategories = {
		recent: ["😀", "😂", "😍", "🥰", "😊", "😎", "🤔", "😢"],
		smileys: [
			"😀",
			"😃",
			"😄",
			"😁",
			"😆",
			"😅",
			"😂",
			"🤣",
			"😊",
			"😇",
			"🙂",
			"🙃",
			"😉",
			"😌",
			"😍",
			"🥰",
			"😘",
			"😗",
			"😙",
			"😚",
			"😋",
			"😛",
			"😝",
			"😜",
			"🤪",
			"🤨",
			"🧐",
			"🤓",
			"😎",
			"🤩",
			"🥳",
			"😏",
			"😒",
			"😞",
			"😔",
			"😟",
			"😕",
			"🙁",
			"☹️",
			"😣",
			"😖",
			"😫",
			"😩",
			"🥺",
			"😢",
			"😭",
			"😤",
			"😠",
			"😡",
			"🤬",
			"🤯",
			"😳",
			"🥵",
			"🥶",
			"😱",
			"😨",
			"😰",
			"😥",
			"😓",
			"🤗",
		],
		gestures: [
			"👍",
			"👎",
			"👌",
			"🤌",
			"🤏",
			"✌️",
			"🤞",
			"🤟",
			"🤘",
			"🤙",
			"👈",
			"👉",
			"👆",
			"🖕",
			"👇",
			"☝️",
			"👋",
			"🤚",
			"🖐️",
			"✋",
			"🖖",
			"👏",
			"🙌",
			"🤲",
			"🤝",
			"🙏",
			"✍️",
			"💪",
			"🦾",
			"🦿",
			"🦵",
			"🦶",
			"👂",
			"🦻",
			"👃",
			"🧠",
		],
		hearts: [
			"❤️",
			"🧡",
			"💛",
			"💚",
			"💙",
			"💜",
			"🖤",
			"🤍",
			"🤎",
			"💔",
			"❣️",
			"💕",
			"💞",
			"💓",
			"💗",
			"💖",
			"💘",
			"💝",
			"💟",
			"♥️",
			"💌",
			"💋",
			"💍",
			"💎",
		],
		objects: [
			"🔥",
			"💯",
			"💢",
			"💨",
			"💫",
			"⭐",
			"🌟",
			"✨",
			"⚡",
			"☄️",
			"💥",
			"🔴",
			"🟠",
			"🟡",
			"🟢",
			"🔵",
			"🟣",
			"⚫",
			"⚪",
			"🟤",
			"🔺",
			"🔻",
			"🔸",
			"🔹",
		],
	};

	const [activeEmojiCategory, setActiveEmojiCategory] = useState("recent");

	useEffect(() => {
		if (replyTo) {
			inputRef.current?.focus();
		}
	}, [replyTo]);

	useEffect(() => {
		return () => {
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if ((message.trim() || selectedFile) && !isUploading) {
			setIsUploading(true);
			try {
				await onSendMessage({
					content: message.trim(),
					file: selectedFile,
					replyToId: replyTo?.id,
				});
				setMessage("");
				clearSelectedFile();
				setShowFileOptions(false);
			} catch (error) {
				console.error("Error sending message:", error);
			} finally {
				setIsUploading(false);
			}
		}
	};

	const clearSelectedFile = () => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
	};

	const handleFileSelect = (e, type = "file") => {
		const file = e.target.files[0];
		if (file) {
			// Vérifier la taille du fichier (50MB max)
			if (file.size > 50 * 1024 * 1024) {
				alert("File size must be less than 50MB");
				return;
			}

			setSelectedFile(file);
			setShowFileOptions(false);

			// Créer une URL de prévisualisation pour les images et vidéos
			if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
				const url = URL.createObjectURL(file);
				setPreviewUrl(url);
			}
		}
	};

	const handleEmojiSelect = (emoji) => {
		const cursorPosition = inputRef.current?.selectionStart || message.length;
		const newMessage =
			message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
		setMessage(newMessage);

		// Mettre à jour les emojis récents
		const recentEmojis = emojiCategories.recent.filter((e) => e !== emoji);
		emojiCategories.recent = [emoji, ...recentEmojis.slice(0, 7)];

		setTimeout(() => {
			inputRef.current?.focus();
			inputRef.current?.setSelectionRange(
				cursorPosition + emoji.length,
				cursorPosition + emoji.length
			);
		}, 0);
	};

	const handleInputChange = (e) => {
		setMessage(e.target.value);
		if (onTyping) {
			onTyping();
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
					? "audio/webm;codecs=opus"
					: "audio/webm",
			});

			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunksRef.current.push(event.data);
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: mediaRecorder.mimeType || "audio/webm",
				});
				const FileConstructor = window.File || globalThis.File;

				
				// Créer un fichier sans utiliser le constructeur File
				const audioFile = new FileConstructor(
					[audioBlob],
					`voice-${Date.now()}.webm`,
					{
						type: audioBlob.type,
					}
				);

				setSelectedFile(audioFile);

				// Créer URL pour la prévisualisation
				const url = URL.createObjectURL(audioBlob);
				setPreviewUrl(url);

				stream.getTracks().forEach((track) => track.stop());
				setRecordingTime(0);
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Démarrer le compteur de temps
			recordingIntervalRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} catch (error) {
			console.error("Error starting recording:", error);
			alert("Could not access microphone");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
		}
	};

	const cancelRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			setRecordingTime(0);
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
			// Ne pas créer de fichier
			audioChunksRef.current = [];
		}
	};

	const playAudio = () => {
		if (previewUrl && selectedFile?.type?.startsWith("audio/")) {
			if (audioRef.current) {
				if (isPlayingAudio) {
					audioRef.current.pause();
					setIsPlayingAudio(false);
				} else {
					audioRef.current.play();
					setIsPlayingAudio(true);
				}
			}
		}
	};

	const formatRecordingTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getFilePreview = () => {
		if (!selectedFile) return null;

		const fileType = selectedFile.type;
		const fileName = selectedFile.name;

		if (fileType.startsWith("image/")) {
			return (
				<div className="relative inline-block max-w-xs">
					<img
						src={previewUrl || "/placeholder.svg"}
						alt="Preview"
						className="max-w-full max-h-48 rounded-lg object-cover"
					/>
					<div className="absolute top-2 right-2 flex space-x-1">
						<button
							onClick={clearSelectedFile}
							className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
						>
							<X size={16} />
						</button>
					</div>
					<div className="mt-2">
						<input
							type="text"
							placeholder="Add a caption..."
							className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
							onChange={(e) => setMessage(e.target.value)}
							value={message}
						/>
					</div>
				</div>
			);
		}

		if (fileType.startsWith("audio/")) {
			return (
				<div className="flex items-center space-x-3 bg-green-100 dark:bg-green-900/30 rounded-lg p-3 max-w-xs">
					<button
						onClick={playAudio}
						className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600"
					>
						{isPlayingAudio ? <Pause size={20} /> : <Play size={20} />}
					</button>
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
							Voice Message
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{fileName?.includes("voice-") ? "Recorded audio" : fileName}
						</p>
					</div>
					<button
						onClick={clearSelectedFile}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
					>
						<Trash2 size={16} />
					</button>
					{previewUrl && (
						<audio
							ref={audioRef}
							src={previewUrl}
							onEnded={() => setIsPlayingAudio(false)}
							className="hidden"
						/>
					)}
				</div>
			);
		}

		return (
			<div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-600 rounded-lg p-3 max-w-xs">
				<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
					<File size={20} className="text-white" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
						{fileName}
					</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{(selectedFile.size / 1024 / 1024).toFixed(1)} MB
					</p>
				</div>
				<button
					onClick={clearSelectedFile}
					className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
				>
					<Trash2 size={16} />
				</button>
			</div>
		);
	};

	// Détermine si on doit afficher le bouton micro ou send
	const showMicButton = !message.trim() && !selectedFile && !isRecording;

	return (
		<div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800">
			{/* Reply preview */}
			{replyTo && (
				<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-l-4 border-green-500 flex items-center justify-between">
					<div className="flex-1 min-w-0">
						<p className="text-sm text-green-600 dark:text-green-400 font-medium">
							Replying to {replyTo.sender?.username || replyTo.sender?.name}
						</p>
						<p className="text-sm text-gray-800 dark:text-gray-200 truncate">
							{replyTo.content ||
								(replyTo.message_type !== "text"
									? `${replyTo.message_type} message`
									: "Message")}
						</p>
					</div>
					<button
						onClick={onCancelReply}
						className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ml-2"
					>
						<X size={16} />
					</button>
				</div>
			)}

			{/* File preview */}
			{selectedFile && (
				<div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
					{getFilePreview()}
				</div>
			)}

			{/* Recording interface */}
			{isRecording && (
				<div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
							<span className="text-sm font-medium text-red-600 dark:text-red-400">
								Recording... {formatRecordingTime(recordingTime)}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={cancelRecording}
								className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
							>
								Cancel
							</button>
							<button
								onClick={stopRecording}
								className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
							>
								Stop
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Emoji picker */}
			{showEmojiPicker && (
				<div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
					{/* Emoji categories */}
					<div className="flex space-x-4 mb-3 border-b border-gray-200 dark:border-gray-600">
						{Object.keys(emojiCategories).map((category) => (
							<button
								key={category}
								onClick={() => setActiveEmojiCategory(category)}
								className={`pb-2 text-sm font-medium capitalize ${
									activeEmojiCategory === category
										? "text-green-600 dark:text-green-400 border-b-2 border-green-500"
										: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								}`}
							>
								{category}
							</button>
						))}
					</div>

					{/* Emoji grid */}
					<div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
						{emojiCategories[activeEmojiCategory].map((emoji, index) => (
							<button
								key={index}
								onClick={() => handleEmojiSelect(emoji)}
								className="text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-1 transition-colors"
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			)}

			{/* File options */}
			{showFileOptions && (
				<div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
					<div className="flex space-x-4">
						<button
							onClick={() => imageInputRef.current?.click()}
							className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							<ImageIcon size={18} />
							<span className="text-sm">Photo</span>
						</button>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
						>
							<File size={18} />
							<span className="text-sm">Document</span>
						</button>
					</div>
				</div>
			)}

			<div className="p-3 flex items-end space-x-2">
				{/* Action buttons */}
				<div className="flex items-center space-x-1">
					<button
						type="button"
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
						onClick={() => setShowEmojiPicker(!showEmojiPicker)}
					>
						<Smile size={20} />
					</button>
					<button
						type="button"
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
						onClick={() => setShowFileOptions(!showFileOptions)}
					>
						<Paperclip size={20} />
					</button>
				</div>

				{/* Hidden file inputs */}
				<input
					ref={fileInputRef}
					type="file"
					onChange={(e) => handleFileSelect(e, "file")}
					className="hidden"
					accept=".pdf,.doc,.docx,.txt,.zip,.rar"
				/>
				<input
					ref={imageInputRef}
					type="file"
					onChange={(e) => handleFileSelect(e, "image")}
					className="hidden"
					accept="image/*,video/*"
				/>

				{/* Message input */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 flex items-end space-x-2"
				>
					<div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
						<textarea
							ref={inputRef}
							value={message}
							onChange={handleInputChange}
							placeholder="Type a message..."
							className="w-full bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 focus:outline-none resize-none max-h-32"
							rows={1}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
							style={{
								minHeight: "40px",
								height: "auto",
							}}
							onInput={(e) => {
								e.target.style.height = "auto";
								e.target.style.height =
									Math.min(e.target.scrollHeight, 128) + "px";
							}}
						/>
					</div>

					{/* Send/Mic button */}
					{showMicButton ? (
						<button
							type="button"
							onMouseDown={startRecording}
							onMouseUp={stopRecording}
							onMouseLeave={stopRecording}
							onTouchStart={startRecording}
							onTouchEnd={stopRecording}
							className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
						>
							<Mic size={20} />
						</button>
					) : (
						<button
							type="submit"
							disabled={isUploading || (!message.trim() && !selectedFile)}
							className={`p-2 rounded-full transition-colors ${
								message.trim() || selectedFile
									? "bg-green-600 hover:bg-green-700 text-white"
									: "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
							} ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							{isUploading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<Send size={20} />
							)}
						</button>
					)}
				</form>
			</div>
		</div>
	);
};

export default MessageInput;
