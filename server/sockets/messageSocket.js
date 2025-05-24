const messageService = require('../services/messageService');

exports.setupMessageSocket = (socket, io) => {
	// Message principal déjà présent
	socket.on('send_message', async (data) => {
		try {
			const messageData = {
				...data,
				senderId: socket.user.id
			};

			const savedMessage = await messageService.createMessage(messageData);

			// Tu peux améliorer ceci plus tard avec io.to('conversation_room').emit(...)
			io.emit(`receive_message_${data.receiverId}`, savedMessage);
		} catch (err) {
			console.error('Erreur send_message:', err);
		}
	});

	// ✅ Rejoins une conversation (room)
	socket.on('join_conversation', (conversationId) => {
		socket.join(`conversation_${conversationId}`);
	});

	// ✅ Quitte une conversation (room)
	socket.on('leave_conversation', (conversationId) => {
		socket.leave(`conversation_${conversationId}`);
	});

	// ✅ Commence à taper
	socket.on('typing_start', ({ conversationId }) => {
		socket.to(`conversation_${conversationId}`).emit('user_typing', {
			userId: socket.user.id,
			conversationId
		});
	});

	// ✅ Arrête de taper
	socket.on('typing_stop', ({ conversationId }) => {
		socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
			userId: socket.user.id,
			conversationId
		});
	});
};
