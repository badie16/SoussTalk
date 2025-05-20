
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Connexion au serveur Socket.IO
const socket = io("http://localhost:5000");

// Récupération du nom d'utilisateur depuis localStorage
const username = localStorage.getItem("username") || "Anonyme";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim() !== "") {
      const data = {
        username,
        message,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", data);
      setChat((prevChat) => [...prevChat, data]);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💬 Bienvenue {username}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {chat.map((msg, idx) => (
          <div key={idx}>
            <strong>[{msg.time}] {msg.username || "Inconnu"}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "80%", padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px" }}>
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default Chat;
