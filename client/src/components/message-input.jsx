"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, Smile, Mic } from "lucide-react";

const MessageInput = ({ onSendMessage }) => {
	const [message, setMessage] = useState("");
	const inputRef = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (message.trim()) {
			onSendMessage(message);
			setMessage("");
		}
	};

	return (
		<div className=" dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex items-end">
			<div className="flex items-center text-[#8696a0] mx-2">
				<button type="button" className="p-2 rounded-full hover:bg-[#384249]">
					<Smile size={24} />
				</button>
				<button type="button" className="p-2 rounded-full hover:bg-[#384249]">
					<Paperclip size={24} />
				</button>
			</div>

			<form onSubmit={handleSubmit} className="flex-1 flex">
				<div className="flex-1 bg-[#2a3942] rounded-lg px-3 py-2">
					<input
						type="text"
						ref={inputRef}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message"
						className="w-full bg-transparent text-[#d1d7db] focus:outline-none"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>
				</div>

				<button
					type="submit"
					className="p-2 rounded-full text-[#8696a0] hover:bg-[#384249] mx-2"
				>
					{message.trim() ? <Send size={24} /> : <Mic size={24} />}
				</button>
			</form>
		</div>
	);
};

export default MessageInput;
