const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

// Créer une notification
const createNotification = async (req, res) => {
	try {
		const { userId, type, title, message, data } = req.body;

		const notification = {
			id: uuidv4(),
			user_id: userId,
			type,
			title,
			message,
			data: data || {},
			is_read: false,
			created_at: new Date().toISOString(),
		};

		const { data: newNotification, error } = await supabase
			.from("notifications")
			.insert([notification])
			.select()
			.single();

		if (error) throw error;

		// Envoyer la notification en temps réel via Socket.io
		if (req.io) {
			req.io.to(`user_${userId}`).emit("new_notification", newNotification);
		}

		res.status(201).json(newNotification);
	} catch (error) {
		console.error("Error creating notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la création de la notification" });
	}
};

// Obtenir les notifications d'un utilisateur
const getUserNotifications = async (req, res) => {
	try {
		const { userId } = req.params;
		const { limit = 50, offset = 0 } = req.query;

		// Vérifier que l'utilisateur demande ses propres notifications
		if (req.user.id !== userId && req.user.role !== "admin") {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const { data: notifications, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		res.status(200).json(notifications);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération des notifications" });
	}
};

// Marquer une notification comme lue
const markNotificationAsRead = async (req, res) => {
	try {
		const { notificationId } = req.params;

		// Vérifier que la notification appartient à l'utilisateur
		const { data: notification, error: fetchError } = await supabase
			.from("notifications")
			.select("user_id")
			.eq("id", notificationId)
			.single();

		if (fetchError || !notification) {
			return res.status(404).json({ error: "Notification non trouvée" });
		}

		if (req.user.id !== notification.user_id && req.user.role !== "admin") {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("id", notificationId);

		if (error) throw error;

		res.status(200).json({ message: "Notification marquée comme lue" });
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la mise à jour de la notification" });
	}
};

// Marquer toutes les notifications comme lues
const markAllNotificationsAsRead = async (req, res) => {
	try {
		const { userId } = req.params;

		// Vérifier que l'utilisateur marque ses propres notifications
		if (req.user.id !== userId && req.user.role !== "admin") {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("user_id", userId)
			.eq("is_read", false);

		if (error) throw error;

		res
			.status(200)
			.json({ message: "Toutes les notifications marquées comme lues" });
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la mise à jour des notifications" });
	}
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
	try {
		const { notificationId } = req.params;

		// Vérifier que la notification appartient à l'utilisateur
		const { data: notification, error: fetchError } = await supabase
			.from("notifications")
			.select("user_id")
			.eq("id", notificationId)
			.single();

		if (fetchError || !notification) {
			return res.status(404).json({ error: "Notification non trouvée" });
		}

		if (req.user.id !== notification.user_id && req.user.role !== "admin") {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const { error } = await supabase
			.from("notifications")
			.delete()
			.eq("id", notificationId);

		if (error) throw error;

		res.status(200).json({ message: "Notification supprimée" });
	} catch (error) {
		console.error("Error deleting notification:", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la suppression de la notification" });
	}
};

// Obtenir le nombre de notifications non lues
const getUnreadCount = async (req, res) => {
	try {
		const { userId } = req.params;

		// Vérifier que l'utilisateur demande ses propres notifications
		if (req.user.id !== userId && req.user.role !== "admin") {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const { count, error } = await supabase
			.from("notifications")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("is_read", false);

		if (error) throw error;

		res.status(200).json({ unreadCount: count || 0 });
	} catch (error) {
		console.error("Error getting unread count:", error);
		res
			.status(500)
			.json({ error: "Erreur lors du comptage des notifications" });
	}
};

module.exports = {
	createNotification,
	getUserNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	getUnreadCount,
};
