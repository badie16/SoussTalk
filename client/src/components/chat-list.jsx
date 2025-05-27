"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Plus, Users } from "lucide-react"
import messageService from "../services/messageService"
import GroupCreationModal from "./group-creation-modal"
import FriendsListModal from "./friends-list-modal"

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    loadConversations()
    setupSocketListeners()

    return () => {
      cleanupSocketListeners()
    }
  }, [])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const userConversations = await messageService.getUserConversations()
      setConversations(userConversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupSocketListeners = () => {
    // Nouveaux messages
    messageService.on("new_message", handleNewMessage)
    messageService.on("message_sent", handleMessageSent)

    // Réactions
    messageService.on("message_reaction", handleMessageReaction)

    // Messages lus
    messageService.on("messages_read", handleMessagesRead)

    // Conversations
    messageService.on("new_conversation", handleNewConversation)
    messageService.on("group_name_updated", handleGroupNameUpdate)

    // Statut utilisateurs
    messageService.on("user_status_changed", handleUserStatusChanged)

    // Messages supprimés/édités
    messageService.on("message_deleted", handleMessageDeleted)
    messageService.on("message_edited", handleMessageEdited)

    // Typing indicators
    messageService.on("user_typing", handleUserTyping)
    messageService.on("user_stopped_typing", handleUserStoppedTyping)
  }

  const cleanupSocketListeners = () => {
    messageService.off("new_message", handleNewMessage)
    messageService.off("message_sent", handleMessageSent)
    messageService.off("message_reaction", handleMessageReaction)
    messageService.off("messages_read", handleMessagesRead)
    messageService.off("new_conversation", handleNewConversation)
    messageService.off("group_name_updated", handleGroupNameUpdate)
    messageService.off("user_status_changed", handleUserStatusChanged)
    messageService.off("message_deleted", handleMessageDeleted)
    messageService.off("message_edited", handleMessageEdited)
    messageService.off("user_typing", handleUserTyping)
    messageService.off("user_stopped_typing", handleUserStoppedTyping)
  }

  // Gestionnaires d'événements optimisés
  const handleNewMessage = useCallback(
    (message) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId || conv.id === message.conversation_id) {
            return {
              ...conv,
              lastMessage: {
                content: message.content || getMessageTypeText(message.message_type),
                timestamp: message.created_at || message.timestamp,
                senderName: message.sender?.username || message.sender?.name,
                messageType: message.message_type || "text",
              },
              unreadCount: conv.id === selectedChatId ? 0 : (conv.unreadCount || 0) + 1,
              updatedAt: message.created_at || message.timestamp,
            }
          }
          return conv
        })

        // Trier par dernière activité
        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt || b.lastMessage?.timestamp || 0) -
            new Date(a.updatedAt || a.lastMessage?.timestamp || 0),
        )
      })
    },
    [selectedChatId],
  )

  const handleMessageSent = useCallback(
    (message) => {
      handleNewMessage(message)
    },
    [handleNewMessage],
  )

  const handleMessageReaction = useCallback((data) => {
    // Mettre à jour l'indicateur de dernière activité
    setConversations((prev) =>
      prev.map((conv) => (conv.id === data.conversationId ? { ...conv, updatedAt: new Date().toISOString() } : conv)),
    )
  }, [])

  const handleMessagesRead = useCallback((data) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === data.conversationId ? { ...conv, unreadCount: 0 } : conv)),
    )
  }, [])

  const handleNewConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const existingConv = prev.find((conv) => conv.id === conversation.id)
      if (!existingConv) {
        return [conversation, ...prev]
      }
      return prev
    })
  }, [])

  const handleGroupNameUpdate = useCallback((data) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === data.conversationId ? { ...conv, name: data.newName } : conv)),
    )
  }, [])

  const handleUserStatusChanged = useCallback((data) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev)
      if (data.isOnline) {
        newSet.add(data.userId)
      } else {
        newSet.delete(data.userId)
      }
      return newSet
    })

    // Mettre à jour le statut dans les conversations
    setConversations((prev) =>
      prev.map((conv) => {
        if (!conv.isGroup && conv.userId === data.userId) {
          return { ...conv, online: data.isOnline, lastSeen: data.lastSeen }
        }
        return conv
      }),
    )
  }, [])

  const handleMessageDeleted = useCallback((data) => {
    // Recharger les conversations pour mettre à jour le dernier message
    loadConversations()
  }, [])

  const handleMessageEdited = useCallback((message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === message.conversation_id && conv.lastMessage?.timestamp === message.created_at) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              content: message.content,
            },
          }
        }
        return conv
      }),
    )
  }, [])

  const handleUserTyping = useCallback((data) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === data.conversationId ? { ...conv, isTyping: true, typingUser: data.username } : conv,
      ),
    )
  }, [])

  const handleUserStoppedTyping = useCallback((data) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === data.conversationId ? { ...conv, isTyping: false, typingUser: null } : conv)),
    )
  }, [])

  const handleCreateGroup = (selectedFriends) => {
    setSelectedFriendsForGroup(selectedFriends)
    setShowGroupModal(true)
  }

  const handleGroupCreated = (group) => {
    setConversations((prev) => [group, ...prev])
    setShowGroupModal(false)
    setSelectedFriendsForGroup([])
  }

  const handleStartChat = async (friend) => {
    try {
      const existingConv = conversations.find((conv) => !conv.isGroup && conv.userId === friend.id)

      if (existingConv) {
        onSelectChat(existingConv)
        return
      }

      const conversation = await messageService.createPrivateConversation(friend.id)
      const chatData = {
        id: conversation.id,
        name: friend.name,
        avatar: friend.avatar_url,
        isGroup: false,
        userId: friend.id,
        online: friend.is_online,
        unreadCount: 0,
      }

      setConversations((prev) => {
        const exists = prev.find((conv) => conv.id === chatData.id)
        if (!exists) {
          return [chatData, ...prev]
        }
        return prev
      })

      onSelectChat(chatData)
    } catch (error) {
      console.error("Error creating conversation:", error)
      if (error.message.includes("already exists")) {
        loadConversations()
      } else {
        alert("Failed to start chat. Please try again.")
      }
    }
  }

  // Fonction utilitaire pour obtenir le texte du type de message
  const getMessageTypeText = (messageType) => {
    switch (messageType) {
      case "image":
        return "📷 Image"
      case "video":
        return "🎥 Video"
      case "audio":
        return "🎵 Audio"
      case "file":
        return "📎 File"
      default:
        return "Message"
    }
  }

  // Filtrer et trier les conversations
  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter((conv) => conv.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Trier par dernière activité
    return filtered.sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.lastMessage?.timestamp || 0)
      const bTime = new Date(b.updatedAt || b.lastMessage?.timestamp || 0)
      return bTime - aTime
    })
  }, [conversations, searchQuery])

  // Séparer les groupes et les conversations privées
  const groups = filteredConversations.filter((conv) => conv.isGroup)
  const privateChats = filteredConversations.filter((conv) => !conv.isGroup)

  return (
    <>
      <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Chats</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Create Group"
            >
              <Users size={18} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setShowFriendsModal(true)}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Groups */}
              {groups.length > 0 && (
                <div className="px-4 mt-2">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wider">GROUPS</h2>
                  <div className="space-y-1">
                    {groups.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={conversation.id === selectedChatId}
                        onClick={() => onSelectChat(conversation)}
                        isOnline={onlineUsers.has(conversation.userId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Private Chats */}
              {privateChats.length > 0 && (
                <div className="px-4 mt-6">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wider">
                    DIRECT MESSAGES
                  </h2>
                  <div className="space-y-1">
                    {privateChats.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={conversation.id === selectedChatId}
                        onClick={() => onSelectChat(conversation)}
                        isOnline={onlineUsers.has(conversation.userId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {filteredConversations.length === 0 && !isLoading && (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? `No conversations found for "${searchQuery}"` : "No conversations yet"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <GroupCreationModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false)
          setSelectedFriendsForGroup([])
        }}
        selectedFriends={selectedFriendsForGroup}
        onGroupCreated={handleGroupCreated}
      />
      <FriendsListModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        onStartChat={handleStartChat}
        onCreateGroup={handleCreateGroup}
      />
    </>
  )
}

function ConversationItem({ conversation, isSelected, onClick, isOnline }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getAvatar = () => {
    if (conversation.isGroup) {
      return (
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Users size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
      )
    } else {
      if (conversation.avatar) {
        return (
          <img
            src={conversation.avatar || "/placeholder.svg"}
            alt={conversation.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        )
      } else {
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="font-medium text-green-600 dark:text-green-400">
              {conversation.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )
      }
    }
  }

  const getLastMessageText = () => {
    if (conversation.isTyping) {
      return <span className="text-green-600 dark:text-green-400 italic">{conversation.typingUser} is typing...</span>
    }

    if (conversation.lastMessage) {
      const { content, messageType, senderName } = conversation.lastMessage
      const messageText = content || getMessageTypeText(messageType)

      if (conversation.isGroup && senderName) {
        return (
          <>
            <span className="font-medium">{senderName}: </span>
            {messageText}
          </>
        )
      }

      return messageText
    }

    return ""
  }

  const getMessageTypeText = (messageType) => {
    switch (messageType) {
      case "image":
        return "📷 Image"
      case "video":
        return "🎥 Video"
      case "audio":
        return "🎵 Audio"
      case "file":
        return "📎 File"
      default:
        return "Message"
    }
  }

  return (
    <div
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        {getAvatar()}
        {!conversation.isGroup && (isOnline || conversation.online) && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p
            className={`text-sm font-medium truncate ${
              isSelected ? "text-green-600 dark:text-green-500" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {conversation.name}
            {conversation.isGroup && conversation.memberCount && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({conversation.memberCount})</span>
            )}
          </p>
          <div className="flex items-center space-x-2">
            {conversation.lastMessage && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(conversation.lastMessage.timestamp)}
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getLastMessageText()}</p>
      </div>
    </div>
  )
}

export default ChatList
