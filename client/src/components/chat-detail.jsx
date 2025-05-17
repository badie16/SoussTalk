"use client"

import { useState, useEffect } from "react"
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react"
import MessageList from "./message-list"
import MessageInput from "./message-input"

const ChatDetail = ({ chat, onBack, currentUserId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  // Simulate loading messages
  useEffect(() => {
    if (chat) {
      setLoading(true)
      // In a real app, you would fetch messages from your API
      setTimeout(() => {
        // Sample messages for demonstration
        const sampleMessages = [
          {
            id: "1",
            content: "Hey there! How are you doing?",
            timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            sender: {
              id: chat.id,
              name: chat.name,
              avatar: chat.avatar,
            },
            status: "read",
          },
          {
            id: "2",
            content: "I'm good, thanks! Just working on the new project. How about you?",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            sender: {
              id: currentUserId,
              name: "You",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            status: "read",
          },
          {
            id: "3",
            content: "That's great! I'm doing well too. Can we discuss the project tomorrow?",
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            sender: {
              id: chat.id,
              name: chat.name,
              avatar: chat.avatar,
            },
            status: "read",
          },
          {
            id: "4",
            content: "Sure, what time works for you?",
            timestamp: new Date(Date.now() - 600000), // 10 minutes ago
            sender: {
              id: currentUserId,
              name: "You",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            status: "delivered",
          },
        ]
        setMessages(sampleMessages)
        setLoading(false)
      }, 1000)
    }
  }, [chat, currentUserId])

  const handleSendMessage = (content) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      sender: {
        id: currentUserId,
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      status: "sent",
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])

    // Simulate message delivery status update
    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)),
      )
    }, 1000)
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat header */}
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={onBack}
          className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center flex-1">
          <div className="relative">
            <img
              src={chat.avatar || "/placeholder.svg?height=40&width=40"}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {chat.online && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{chat.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{chat.online ? "Online" : "Offline"}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <Phone size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <Video size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <MessageList messages={messages} currentUserId={currentUserId} />
      )}

      {/* Message input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatDetail
