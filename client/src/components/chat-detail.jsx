"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Video, MoreVertical, Search, ArrowLeft, Users } from "lucide-react"
import MessageList from "./message-list"
import MessageInput from "./message-input"
import messageService from "../services/messageService"
import logo from "../assets/logo.png"

const MESSAGES_PER_PAGE = 30

const ChatDetail = ({ chat, onBack, currentUserId }) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [replyTo, setReplyTo] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const [showMembers, setShowMembers] = useState(false)
  const [members, setMembers] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const typingTimeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    if (chat) {
      // Reset state when chat changes
      setMessages([])
      setCurrentPage(0)
      setHasMore(true)
      setTypingUsers([])
      setReplyTo(null)

      loadInitialMessages()
      loadMembers()
      joinConversation()

      // Mark messages as read
      messageService.markAsRead(chat.id)

      // Setup event listeners
      setupEventListeners()

      return () => {
        cleanupEventListeners()
        leaveConversation()
      }
    }
  }, [chat])

  // Auto online status management
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      messageService.updateUserStatus(true)
    }

    const checkActivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current

      // Set offline after 5 minutes of inactivity
      if (timeSinceLastActivity > 5 * 60 * 1000) {
        messageService.updateUserStatus(false)
      }
    }

    // Track user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check activity every minute
    const activityInterval = setInterval(checkActivity, 60000)

    // Set online when component mounts
    updateActivity()

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        messageService.updateUserStatus(false)
      } else {
        updateActivity()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Handle page unload
    const handleBeforeUnload = () => {
      messageService.updateUserStatus(false)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(activityInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      messageService.updateUserStatus(false)
    }
  }, [])

  const loadInitialMessages = async () => {
    if (!chat) return

    try {
      setIsLoading(true)
      // Load messages in chronological order (oldest to newest for display)
      const fetchedMessages = await messageService.getMessages(chat.id, MESSAGES_PER_PAGE, 0)
      // Messages come from API in desc order (newest first), we keep them as is for WhatsApp-like display
      setMessages(fetchedMessages)
      setHasMore(fetchedMessages.length === MESSAGES_PER_PAGE)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error loading initial messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!chat || isLoading || !hasMore) return

    try {
      setIsLoading(true)
      const offset = currentPage * MESSAGES_PER_PAGE
      const olderMessages = await messageService.getMessages(chat.id, MESSAGES_PER_PAGE, offset)

      if (olderMessages.length > 0) {
        // Prepend older messages to the beginning of the array
        setMessages((prev) => [...olderMessages, ...prev])
        setCurrentPage((prev) => prev + 1)
        setHasMore(olderMessages.length === MESSAGES_PER_PAGE)
      } else {
        setHasMore(false)
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Error loading more messages:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMembers = async () => {
    if (!chat || !chat.isGroup) return

    try {
      const fetchedMembers = await messageService.getConversationMembers(chat.id)
      setMembers(fetchedMembers)
    } catch (error) {
      console.error("Error loading members:", error)
    }
  }

  const setupEventListeners = () => {
    messageService.on("new_message", handleNewMessage)
    messageService.on("message_sent", handleMessageSent)
    messageService.on("message_deleted", handleMessageDeleted)
    messageService.on("message_edited", handleMessageEdited)
    messageService.on("message_reaction", handleMessageReaction)
    messageService.on("user_typing", handleUserTyping)
    messageService.on("user_stopped_typing", handleUserStoppedTyping)
    messageService.on("member_added", handleMemberAdded)
    messageService.on("member_removed", handleMemberRemoved)
    messageService.on("group_name_updated", handleGroupNameUpdated)
  }

  const cleanupEventListeners = () => {
    messageService.off("new_message", handleNewMessage)
    messageService.off("message_sent", handleMessageSent)
    messageService.off("message_deleted", handleMessageDeleted)
    messageService.off("message_edited", handleMessageEdited)
    messageService.off("message_reaction", handleMessageReaction)
    messageService.off("user_typing", handleUserTyping)
    messageService.off("user_stopped_typing", handleUserStoppedTyping)
    messageService.off("member_added", handleMemberAdded)
    messageService.off("member_removed", handleMemberRemoved)
    messageService.off("group_name_updated", handleGroupNameUpdated)
  }

  const joinConversation = () => {
    if (chat) {
      messageService.joinConversation(chat.id)
    }
  }

  const leaveConversation = () => {
    if (chat) {
      messageService.leaveConversation(chat.id)
    }
  }

  // Event handlers
  const handleNewMessage = (message) => {
    if (message.conversationId === chat?.id || message.conversation_id === chat?.id) {
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const exists = prev.find((msg) => msg.id === message.id)
        if (!exists) {
          // Add new message at the end (WhatsApp style - newest at bottom)
          return [...prev, message]
        }
        return prev
      })

      // Mark as read if conversation is active and message is from another user
      if (document.hasFocus() && message.sender?.id !== currentUserId) {
        setTimeout(() => {
          messageService.markAsRead(chat.id)
        }, 1000)
      }
    }
  }

  const handleMessageSent = (message) => {
    if (message.conversationId === chat?.id || message.conversation_id === chat?.id) {
      setMessages((prev) => {
        const exists = prev.find((msg) => msg.id === message.id)
        if (!exists) {
          // Add sent message at the end
          return [...prev, message]
        }
        return prev
      })
    }
  }

  const handleMessageDeleted = (data) => {
    if (data.conversationId === chat?.id) {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
    }
  }

  const handleMessageEdited = (editedMessage) => {
    if (editedMessage.conversation_id === chat?.id) {
      setMessages((prev) => prev.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg)))
    }
  }

  const handleMessageReaction = (data) => {
    if (data.conversationId === chat?.id) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const reactions = msg.reactions || []
            if (data.action === "added") {
              return {
                ...msg,
                reactions: [
                  ...reactions,
                  {
                    id: Date.now(),
                    emoji: data.emoji,
                    user: { id: data.userId },
                  },
                ],
              }
            } else {
              return {
                ...msg,
                reactions: reactions.filter((r) => !(r.emoji === data.emoji && r.user.id === data.userId)),
              }
            }
          }
          return msg
        }),
      )
    }
  }

  const handleUserTyping = (data) => {
    if (data.conversationId === chat?.id && data.userId !== currentUserId) {
      setTypingUsers((prev) => {
        if (!prev.find((user) => user.userId === data.userId)) {
          return [...prev, { userId: data.userId, username: data.username }]
        }
        return prev
      })
    }
  }

  const handleUserStoppedTyping = (data) => {
    if (data.conversationId === chat?.id) {
      setTypingUsers((prev) => prev.filter((user) => user.userId !== data.userId))
    }
  }

  const handleMemberAdded = (data) => {
    if (data.conversationId === chat?.id) {
      setMembers((prev) => [...prev, data.newMember])
    }
  }

  const handleMemberRemoved = (data) => {
    if (data.conversationId === chat?.id) {
      setMembers((prev) => prev.filter((member) => member.id !== data.removedUserId))
    }
  }

  const handleGroupNameUpdated = (data) => {
    if (data.conversationId === chat?.id) {
      // Update group name in parent component would need a callback
    }
  }

  // Message actions
  const handleSendMessage = async (messageData) => {
    try {
      await messageService.sendMessage({
        conversationId: chat.id,
        content: messageData.content,
        file: messageData.file,
        replyToId: messageData.replyToId,
      })
      setReplyTo(null)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleReply = (message) => {
    setReplyTo(message)
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  const handleReact = async (messageId, emoji) => {
    try {
      await messageService.addReaction(messageId, emoji)
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const handleEdit = (message) => {
    const newContent = prompt("Edit message:", message.content)
    if (newContent && newContent.trim() !== message.content) {
      messageService.editMessage(message.id, newContent.trim()).catch((error) => {
        console.error("Error editing message:", error)
        alert("Failed to edit message.")
      })
    }
  }

  const handleDelete = async (messageId) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await messageService.deleteMessage(messageId)
      } catch (error) {
        console.error("Error deleting message:", error)
        alert("Failed to delete message.")
      }
    }
  }

  const handleTyping = () => {
    messageService.startTyping(chat.id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      messageService.stopTyping(chat.id)
    }, 3000)
  }

  const formatTypingText = () => {
    if (typingUsers.length === 0) return ""
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`
  }

  if (!chat) {
    return (
      <div className="flex-1 p-6 overflow-y-auto show-scrollbar-on-hover flex items-center justify-center h-full">
        <div className="text-center max-w-md w-full">
          <div className="mx-auto w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <img className="w-4/5" src={logo || "/placeholder.svg"} alt="SoussTalk" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-200 mb-4">Welcome to SoussTalk Chat App</h1>

          <p className="text-gray-400 mb-8">
            Select a chat from the sidebar or start a new conversation to begin messaging.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile */}
          <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="relative">
            {chat.isGroup ? (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <>
                {chat.avatar ? (
                  <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {chat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {chat.online && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
                )}
              </>
            )}
          </div>

          {/* Name and status */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {chat.name}
              {chat.isGroup && members.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({members.length})</span>
              )}
            </h2>
            {typingUsers.length > 0 ? (
              <p className="text-sm text-green-600 dark:text-green-400">{formatTypingText()}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chat.isGroup ? "Group chat" : chat.online ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Search size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          {!chat.isGroup && (
            <>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Phone size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Video size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
          {chat.isGroup && (
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Users size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Members sidebar for groups */}
      {chat.isGroup && showMembers && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4 flex-shrink-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Members ({members.length})</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <div className="relative">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url || "/placeholder.svg"}
                      alt={member.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {member.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-gray-700" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {member.first_name || member.last_name
                    ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
                    : member.username}
                  {member.role === "admin" && (
                    <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(Admin)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages - WhatsApp style layout */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onReply={handleReply}
        onReact={handleReact}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLoadMore={loadMoreMessages}
        hasMore={hasMore}
        loading={isLoading}
        conversationId={chat.id}
      />

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          onTyping={handleTyping}
        />
      </div>
    </div>
  )
}

export default ChatDetail
