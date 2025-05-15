"use client"

import { useState } from "react"
import { Send, Paperclip, Smile } from "lucide-react"

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-end">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-1"
        >
          <Paperclip size={20} />
        </button>

        {/* Message input */}
        <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-3 py-2 focus:outline-none resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[44px] max-h-[120px]"
            rows={1}
            style={{ height: "auto", maxHeight: "120px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
        </div>

        {/* Emoji button */}
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mx-1"
        >
          <Smile size={20} />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full ${
            message.trim()
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
          } transition-colors`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
