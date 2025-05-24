"use client";

import { useState, useEffect } from "react";
import {
	Bell,
	X,
	Check,
	MessageSquare,
	UserPlus,
	Users,
	AlertTriangle,
} from "lucide-react";

const NotificationSystem = () => {
	const [notifications, setNotifications] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		// Charger les notifications depuis localStorage
		loadNotifications();

		// Écouter les nouvelles notifications
		window.addEventListener("new-notification", handleNewNotification);

		return () => {
			window.removeEventListener("new-notification", handleNewNotification);
		};
	}, []);

	const loadNotifications = () => {
		try {
			const savedNotifications = localStorage.getItem("notifications");
			if (savedNotifications) {
				const parsed = JSON.parse(savedNotifications);
				setNotifications(parsed);
				setUnreadCount(parsed.filter((n) => !n.read).length);
			}
		} catch (error) {
			console.error("Error loading notifications:", error);
		}
	};

	const saveNotifications = (newNotifications) => {
		try {
			localStorage.setItem("notifications", JSON.stringify(newNotifications));
			setNotifications(newNotifications);
			setUnreadCount(newNotifications.filter((n) => !n.read).length);
		} catch (error) {
			console.error("Error saving notifications:", error);
		}
	};

	const handleNewNotification = (event) => {
		const newNotification = {
			id: Date.now(),
			...event.detail,
			timestamp: new Date(),
			read: false,
		};

		const updatedNotifications = [
			newNotification,
			...notifications.slice(0, 49),
		]; // Garder max 50 notifications
		saveNotifications(updatedNotifications);

		// Afficher une notification browser si supporté
		if (Notification.permission === "granted") {
			new Notification(newNotification.title, {
				body: newNotification.message,
				icon: "/favicon.ico",
			});
		}
	};

	const markAsRead = (notificationId) => {
		const updatedNotifications = notifications.map((n) =>
			n.id === notificationId ? { ...n, read: true } : n
		);
		saveNotifications(updatedNotifications);
	};

	const markAllAsRead = () => {
		const updatedNotifications = notifications.map((n) => ({
			...n,
			read: true,
		}));
		saveNotifications(updatedNotifications);
	};

	const removeNotification = (notificationId) => {
		const updatedNotifications = notifications.filter(
			(n) => n.id !== notificationId
		);
		saveNotifications(updatedNotifications);
	};

	const clearAllNotifications = () => {
		saveNotifications([]);
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "message":
				return <MessageSquare size={16} className="text-blue-500" />;
			case "friend_request":
				return <UserPlus size={16} className="text-green-500" />;
			case "group":
				return <Users size={16} className="text-purple-500" />;
			case "security":
				return <AlertTriangle size={16} className="text-yellow-500" />;
			default:
				return <Bell size={16} className="text-gray-500" />;
		}
	};

	const formatTime = (timestamp) => {
		const now = new Date();
		const diff = now - new Date(timestamp);
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "À l'instant";
		if (minutes < 60) return `Il y a ${minutes}m`;
		if (hours < 24) return `Il y a ${hours}h`;
		return `Il y a ${days}j`;
	};

	// Demander la permission pour les notifications browser
	useEffect(() => {
		if (Notification.permission === "default") {
			Notification.requestPermission();
		}
	}, []);

	return (
		<div className="relative">
			{/* Bouton de notification */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<Bell size={20} className="text-gray-600 dark:text-gray-300" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{/* Panel des notifications */}
			{isOpen && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>

					{/* Panel */}
					<div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden">
						{/* Header */}
						<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="font-semibold text-gray-800 dark:text-gray-200">
								Notifications ({unreadCount})
							</h3>
							<div className="flex space-x-2">
								{unreadCount > 0 && (
									<button
										onClick={markAllAsRead}
										className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
									>
										Tout marquer lu
									</button>
								)}
								<button
									onClick={clearAllNotifications}
									className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
								>
									Effacer tout
								</button>
							</div>
						</div>

						{/* Liste des notifications */}
						<div className="max-h-80 overflow-y-auto">
							{notifications.length === 0 ? (
								<div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
									Aucune notification
								</div>
							) : (
								notifications.map((notification) => (
									<div
										key={notification.id}
										className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
											!notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
										}`}
									>
										<div className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-1">
												{getNotificationIcon(notification.type)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
													{notification.title}
												</p>
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
													{notification.message}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
													{formatTime(notification.timestamp)}
												</p>
											</div>
											<div className="flex-shrink-0 flex space-x-1">
												{!notification.read && (
													<button
														onClick={() => markAsRead(notification.id)}
														className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
														title="Marquer comme lu"
													>
														<Check size={12} className="text-green-500" />
													</button>
												)}
												<button
													onClick={() => removeNotification(notification.id)}
													className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
													title="Supprimer"
												>
													<X size={12} className="text-red-500" />
												</button>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

// Fonction utilitaire pour créer des notifications
export const createNotification = (type, title, message, data = {}) => {
	const event = new CustomEvent("new-notification", {
		detail: {
			type,
			title,
			message,
			data,
		},
	});
	window.dispatchEvent(event);
};

export default NotificationSystem;
