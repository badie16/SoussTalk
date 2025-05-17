"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample data - in a real app, this would come from your API
  const favorites = [
    { id: "1", name: "Marguerite Campbell", initials: "MC", online: true },
    { id: "2", name: "Katrina Winters", initials: "KW" },
    { id: "3", name: "Miranda Valentine", initials: "MV" },
    { id: "4", name: "Faulkner Benjamin", initials: "FB", online: true },
  ]

  const directMessages = [
    { id: "5", name: "Tonia Clay", initials: "TC", online: true },
    { id: "6", name: "Hendrix Martin", initials: "HM" },
    { id: "7", name: "Dean Vargas", initials: "DV" },
    { id: "8", name: "Donaldson Riddle", initials: "DR" },
    { id: "9", name: "Norris Decker", initials: "ND" },
    { id: "10", name: "Zimmerman Langley", initials: "ZL", online: true },
    { id: "11", name: "Badie dev", initials: "BD", online: true },
  ]

  // Filter contacts based on search query
  const filteredFavorites = favorites.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDirectMessages = directMessages.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Chats</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search here.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites */}
        {filteredFavorites.length > 0 && (
          <div className="px-4 mt-2">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wider">FAVOURITES</h2>
            <div className="space-y-1">
              {filteredFavorites.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={contact.id === selectedChatId}
                  onClick={() => onSelectChat(contact)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Direct Messages */}
        {filteredDirectMessages.length > 0 && (
          <div className="px-4 mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">DIRECT MESSAGES</h2>
              <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {filteredDirectMessages.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={contact.id === selectedChatId}
                  onClick={() => onSelectChat(contact)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredFavorites.length === 0 && filteredDirectMessages.length === 0 && searchQuery && (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No contacts found for "{searchQuery}"</p>
          </div>
        )}

        {/* Channels */}
        <div className="px-4 mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">CHANNELS</h2>
            <button className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactItem({ contact, isSelected, onClick }) {
  return (
    <div
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${
        isSelected ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            contact.name.includes("Miranda Valentine") || contact.name.includes("Dean Vargas")
              ? "bg-purple-100 text-purple-600"
              : contact.name.includes("Zimmerman") || contact.name.includes("Badie")
                ? "bg-gray-100 text-gray-600"
                : "bg-green-100 text-green-600"
          }`}
        >
          {contact.avatar ? (
            <img
              src={contact.avatar || "/placeholder.svg"}
              alt={contact.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="font-medium">{contact.initials}</span>
          )}
        </div>
        {contact.online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isSelected ? "text-green-600 dark:text-green-500" : "text-gray-800 dark:text-gray-200"
          }`}
        >
          {contact.name}
        </p>
        {contact.lastMessage && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>
        )}
      </div>
      {contact.unreadCount > 0 && (
        <div className="bg-green-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
          {contact.unreadCount}
        </div>
      )}
    </div>
  )
}

export default ChatList
