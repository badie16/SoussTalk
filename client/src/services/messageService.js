import axios from "axios";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class MessageService {
	constructor() {
		this.socket = null;
		this.messageHandlers = new Map();
		this.isConnected = false;
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
		this.userStatus = "online";
		this.statusUpdateInterval = null;
	}

	// Initialize socket connection
	initializeSocket(token) {
		if (this.socket) {
			this.socket.disconnect();
		}

		this.socket = io(API_URL, {
			auth: {
				token: token,
			},
			transports: ["websocket", "polling"],
			timeout: 20000,
			forceNew: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: this.maxReconnectAttempts,
			reconnectionDelayMax: 5000,
		});

		this.setupSocketListeners();
		this.startStatusUpdates();
		return this.socket;
	}

	setupSocketListeners() {
		if (!this.socket) return;

		this.socket.on("connect", () => {
			console.log("Connected to message service");
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.notifyHandlers("connected", true);

			// Set user online and join conversations
			this.updateUserStatus(true);
			this.socket.emit("join_user_conversations");
		});

		this.socket.on("disconnect", (reason) => {
			console.log("Disconnected from message service:", reason);
			this.isConnected = false;
			this.notifyHandlers("disconnected", { reason });
		});

		this.socket.on("connect_error", (error) => {
			console.error("Connection error:", error);
			this.reconnectAttempts++;
			this.notifyHandlers("connection_error", {
				error,
				attempts: this.reconnectAttempts,
			});
		});

		this.socket.on("reconnect", (attemptNumber) => {
			console.log("Reconnected after", attemptNumber, "attempts");
			this.updateUserStatus(true);
			this.notifyHandlers("reconnected", { attemptNumber });
		});

		this.socket.on("reconnect_failed", () => {
			console.error(
				"Failed to reconnect after",
				this.maxReconnectAttempts,
				"attempts"
			);
			this.notifyHandlers("reconnect_failed", true);
		});

		// Message events
		this.socket.on("new_message", (message) => {
			this.notifyHandlers("new_message", message);
		});

		this.socket.on("message_sent", (message) => {
			this.notifyHandlers("message_sent", message);
		});

		this.socket.on("message_deleted", (data) => {
			this.notifyHandlers("message_deleted", data);
		});

		this.socket.on("message_edited", (message) => {
			this.notifyHandlers("message_edited", message);
		});

		this.socket.on("message_reaction", (data) => {
			this.notifyHandlers("message_reaction", data);
		});

		// Conversation events
		this.socket.on("new_conversation", (conversation) => {
			this.notifyHandlers("new_conversation", conversation);
		});

		this.socket.on("conversation_updated", (data) => {
			this.notifyHandlers("conversation_updated", data);
		});

		this.socket.on("new_group", (group) => {
			this.notifyHandlers("new_group", group);
		});

		// Group events
		this.socket.on("member_added", (data) => {
			this.notifyHandlers("member_added", data);
		});

		this.socket.on("member_removed", (data) => {
			this.notifyHandlers("member_removed", data);
		});

		this.socket.on("group_name_updated", (data) => {
			this.notifyHandlers("group_name_updated", data);
		});

		// Typing events
		this.socket.on("user_typing", (data) => {
			this.notifyHandlers("user_typing", data);
		});

		this.socket.on("user_stopped_typing", (data) => {
			this.notifyHandlers("user_stopped_typing", data);
		});

		// Status events
		this.socket.on("user_status_changed", (data) => {
			this.notifyHandlers("user_status_changed", data);
		});

		this.socket.on("messages_read", (data) => {
			this.notifyHandlers("messages_read", data);
		});

		// Error events
		this.socket.on("message_error", (error) => {
			this.notifyHandlers("message_error", error);
		});

		this.socket.on("reaction_error", (error) => {
			this.notifyHandlers("reaction_error", error);
		});
	}

	// Automatic status updates
	startStatusUpdates() {
		// Update status every 30 seconds
		this.statusUpdateInterval = setInterval(() => {
			if (this.isConnected && this.userStatus === "online") {
				this.socket.emit("heartbeat");
			}
		}, 30000);
	}

	stopStatusUpdates() {
		if (this.statusUpdateInterval) {
			clearInterval(this.statusUpdateInterval);
			this.statusUpdateInterval = null;
		}
	}

	// Update user online status
	updateUserStatus(isOnline) {
		this.userStatus = isOnline ? "online" : "offline";

		if (this.socket && this.isConnected) {
			this.socket.emit("update_status", {
				isOnline,
				timestamp: new Date().toISOString(),
			});
		}
	}

	// Event handler management
	on(event, handler) {
		if (!this.messageHandlers.has(event)) {
			this.messageHandlers.set(event, new Set());
		}
		this.messageHandlers.get(event).add(handler);
	}

	off(event, handler) {
		if (this.messageHandlers.has(event)) {
			this.messageHandlers.get(event).delete(handler);
		}
	}

	notifyHandlers(event, data) {
		if (this.messageHandlers.has(event)) {
			this.messageHandlers.get(event).forEach((handler) => {
				try {
					handler(data);
				} catch (error) {
					console.error(`Error in event handler for ${event}:`, error);
				}
			});
		}
	}

	// API methods with better error handling
	async sendMessage(messageData) {
		try {
			const formData = new FormData();
			formData.append("conversationId", messageData.conversationId);
			formData.append("content", messageData.content || "");
			formData.append("messageType", messageData.messageType || "text");

			if (messageData.replyToId) {
				formData.append("replyToId", messageData.replyToId);
			}

			if (messageData.file) {
				formData.append("file", messageData.file);
				formData.append("messageType", this.getFileType(messageData.file));
			}

			const response = await axios.post(
				`${API_URL}/api/messages/send`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			return response.data;
		} catch (error) {
			console.error("Send message error:", error);
			throw new Error(error.response?.data?.error || "Failed to send message");
		}
	}

	async getMessages(conversationId, limit = 50, offset = 0) {
		try {
			const response = await axios.get(
				`${API_URL}/api/messages/conversation/${conversationId}?limit=${limit}&offset=${offset}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Get messages error:", error);
			throw new Error(
				error.response?.data?.error || "Failed to fetch messages"
			);
		}
	}

	async getUserConversations() {
		try {
			const response = await axios.get(
				`${API_URL}/api/messages/conversations`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Get conversations error:", error);
			throw new Error(
				error.response?.data?.error || "Failed to fetch conversations"
			);
		}
	}

	async createPrivateConversation(userId) {
		try {
			const response = await axios.post(
				`${API_URL}/api/messages/conversation/private`,
				{ userId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Create conversation error:", error);
			throw new Error(
				error.response?.data?.error || "Failed to create conversation"
			);
		}
	}

	async createGroup(name, memberIds = []) {
		try {
			const response = await axios.post(
				`${API_URL}/api/messages/group/create`,
				{ name, memberIds },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Create group error:", error);
			throw new Error(error.response?.data?.error || "Failed to create group");
		}
	}

	async getConversationMembers(conversationId) {
		try {
			const response = await axios.get(
				`${API_URL}/api/messages/group/${conversationId}/members`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Get conversation members error:", error);
			throw new Error(error.response?.data?.error || "Failed to fetch members");
		}
	}

	async getUserFriends() {
		try {
			const response = await axios.get(`${API_URL}/api/messages/friends`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Get friends error:", error);
			throw new Error(error.response?.data?.error || "Failed to fetch friends");
		}
	}

	async markAsRead(conversationId) {
		try {
			const response = await axios.post(
				`${API_URL}/api/messages/conversation/${conversationId}/read`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Mark as read error:", error);
			// Don't throw error for read status
		}
	}

	async deleteMessage(messageId) {
		try {
			const response = await axios.delete(
				`${API_URL}/api/messages/${messageId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Delete message error:", error);
			throw new Error(
				error.response?.data?.error || "Failed to delete message"
			);
		}
	}

	async editMessage(messageId, content) {
		try {
			const response = await axios.put(
				`${API_URL}/api/messages/${messageId}`,
				{ content },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Edit message error:", error);
			throw new Error(error.response?.data?.error || "Failed to edit message");
		}
	}

	async addReaction(messageId, emoji) {
		try {
			const response = await axios.post(
				`${API_URL}/api/messages/${messageId}/reaction`,
				{ emoji },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Add reaction error:", error);
			throw new Error(error.response?.data?.error || "Failed to add reaction");
		}
	}

	// Socket methods
	joinConversation(conversationId) {
		if (this.socket && this.isConnected) {
			this.socket.emit("join_conversation", conversationId);
		}
	}

	leaveConversation(conversationId) {
		if (this.socket && this.isConnected) {
			this.socket.emit("leave_conversation", conversationId);
		}
	}

	startTyping(conversationId) {
		if (this.socket && this.isConnected) {
			this.socket.emit("typing_start", { conversationId });
		}
	}

	stopTyping(conversationId) {
		if (this.socket && this.isConnected) {
			this.socket.emit("typing_stop", { conversationId });
		}
	}

	// Utility methods
	getFileType(file) {
		if (file.type.startsWith("image/")) return "image";
		if (file.type.startsWith("video/")) return "video";
		if (file.type.startsWith("audio/")) return "audio";
		return "file";
	}

	disconnect() {
		this.updateUserStatus(false);
		this.stopStatusUpdates();

		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.messageHandlers.clear();
		this.isConnected = false;
	}

	// Check connection status
	isSocketConnected() {
		return this.isConnected && this.socket?.connected;
	}
}

export default new MessageService();
