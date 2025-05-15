"use client"

import { useRef, useEffect } from "react"
import MessageItem from "./message-items"

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} isOwn={message.sender.id === currentUserId} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}

export default MessageList
