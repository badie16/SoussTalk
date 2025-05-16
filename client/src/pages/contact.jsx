"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Search, Plus, Check } from "lucide-react"
import "../index.css"
import { fetchUsers } from "../services/userService"

const Contacts = () => {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [activeIcon, setActiveIcon] = useState("users")
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in and load contacts
  useEffect(() => {
    const loadUserAndContacts = async () => {
      setIsLoading(true)

      // Check for user authentication
      const userData = localStorage.getItem("user")
      if (!userData) {
        navigate("/login")
        return
      }

      try {
        // Parse user data
        const user = JSON.parse(userData)
        if (user.profileImage) {
          setProfileImage(user.profileImage)
        }

        // Fetch contacts from database
        const userContacts = await fetchUsers()
        setContacts(userContacts)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndContacts()
  }, [navigate])

  // Handle icon click
  const handleIconClick = (iconName) => {
    setActiveIcon(iconName)
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Start a chat with a contact
  const startChat = (contact) => {
    navigate("/chat", { state: { selectedContact: contact } })
  }

  return (
    <main className="flex h-screen bg-[#1a2236] overflow-hidden">
      {/* Left navigation sidebar - fixed position */}
      <div className="fixed left-0 top-0 bottom-0 w-[60px] bg-[#2e2e2e] flex flex-col items-center py-6 z-10">
        {/* App logo */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center transition-transform hover:scale-110 duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        </div>

        {/* Navigation icons */}
        <div className="flex flex-col items-center space-y-8 flex-1">
          <NavIcon icon="user" active={activeIcon === "user"} onClick={() => handleIconClick("user")} to="/profile" />
          <NavIcon
            icon="message-square"
            active={activeIcon === "message-square"}
            onClick={() => handleIconClick("message-square")}
            to="/chat"
          />
          <NavIcon
            icon="users"
            active={activeIcon === "users"}
            onClick={() => handleIconClick("users")}
            to="/contacts"
          />
          <NavIcon icon="phone" active={activeIcon === "phone"} onClick={() => handleIconClick("phone")} />
          <NavIcon icon="bookmark" active={activeIcon === "bookmark"} onClick={() => handleIconClick("bookmark")} />
          <NavIcon icon="settings" active={activeIcon === "settings"} onClick={() => handleIconClick("settings")} />
        </div>

        {/* Theme toggle */}
        <div className="mt-auto mb-4">
          <button className="text-gray-400 hover:text-gray-200 transition-colors hover:rotate-[30deg] transition-transform duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>

        {/* Profile picture */}
        <div className="mt-2">
          <Link
            to="/profile"
            className="block w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 transition-all hover:scale-110 hover:border-green-400 duration-300 focus:outline-none"
          >
            <img src={profileImage || "/placeholder.svg"} alt="User profile" className="object-cover w-full h-full" />
          </Link>
        </div>
      </div>

      {/* Content area - with left margin to account for fixed sidebar */}
      <div className="flex flex-1 ml-[60px]">
        <div className="w-full overflow-y-auto">
          <div className="h-full bg-[#1a2236] flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">Chats</h1>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2a3447] text-gray-300 hover:bg-[#3a4457] transition-colors">
                <Plus size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2a3447] text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <ChatItem key={contact.id} contact={contact} onClick={() => startChat(contact)} />
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-gray-400">
                        {searchQuery ? `No contacts found for "${searchQuery}"` : "No contacts available"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Chat Item Component
function ChatItem({ contact, onClick }) {
  // Format message preview
  const getMessagePreview = () => {
    if (contact.isYourMessage) {
      return (
        <div className="flex items-center">
          <span className="text-gray-400 mr-1">You:</span>
          <span className="text-gray-400 truncate">{contact.lastMessage}</span>
        </div>
      )
    } else if (contact.lastMessage) {
      return <span className="text-gray-400 truncate">{contact.lastMessage}</span>
    }
    return null
  }

  return (
    <div className="flex items-center px-4 py-3 hover:bg-[#2a3447] cursor-pointer" onClick={onClick}>
      {/* User avatar */}
      <div className="relative mr-3">
        {contact.avatar ? (
          <img
            src={contact.avatar || "/placeholder.svg"}
            alt={contact.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              contact.name.includes("Miranda Valentine") || contact.name.includes("Dean Vargas")
                ? "bg-purple-100 text-purple-600"
                : contact.name.includes("Zimmerman") || contact.name.includes("Badie")
                  ? "bg-gray-100 text-gray-600"
                  : "bg-green-100 text-green-600"
            }`}
          >
            <span className="font-medium">{contact.initials}</span>
          </div>
        )}
        {contact.online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-[#1a2236]" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-white truncate">{contact.name}</p>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{contact.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">{getMessagePreview()}</div>

          {contact.isYourMessage && (
            <div className="ml-2">
              {contact.status === "read" ? (
                <Check size={16} className="text-blue-500" />
              ) : (
                <Check size={16} className="text-gray-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced NavIcon component with transitions and direct link support
const NavIcon = ({ icon, active, onClick, to }) => {
  const getIcon = () => {
    let d
    switch (icon) {
      case "user":
        d = "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        return (
          <>
            <path d={d}></path>
            <circle cx="12" cy="7" r="4"></circle>
          </>
        )
      case "message-square":
        d = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        return <path d={d}></path>
      case "users":
        d = "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        return (
          <>
            <path d={d}></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </>
        )
      case "phone":
        d =
          "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        return <path d={d}></path>
      case "bookmark":
        d = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        return <path d={d}></path>
      case "settings":
        d =
          "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        return (
          <>
            <circle cx="12" cy="12" r="3"></circle>
            <path d={d}></path>
          </>
        )
      default:
        return null
    }
  }

  // Common classes for styling
  const commonClasses = `p-3 rounded-md transition-all duration-300 ${
    active
      ? "text-white bg-green-600 shadow-md transform scale-110"
      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
  }`

  // SVG content
  const svgContent = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${active ? "transform scale-110" : ""}`}
    >
      {getIcon()}
    </svg>
  )

  // If a link is provided, use Link component
  if (to) {
    return (
      <Link to={to} className={commonClasses} onClick={onClick}>
        {svgContent}
      </Link>
    )
  }

  // Otherwise use a button
  return (
    <button onClick={onClick} className={commonClasses}>
      {svgContent}
    </button>
  )
}

export default Contacts
