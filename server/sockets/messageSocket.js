const messageService = require('../services/messageService');

exports.setupMessageSocket = (socket, io) => {
	socket.on('send_message', async (data) => {
		try {
			// Assure-toi que senderId est bien celui du socket authentifié
			const messageData = {
				...data,
				senderId: socket.user.id
			};

			const savedMessage = await messageService.createMessage(messageData);

			// Envoie le message à la conversation ou au receiver
			io.emit(`receive_message_${data.receiverId}`, savedMessage);
		} catch (err) {
			console.error('Erreur send_message:', err);
		}
	});
};
