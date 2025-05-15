"use client"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../index.css"
import ChatDetail from "../components/chat-detail"

const Chat = () => {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [activeIcon, setActiveIcon] = useState("message-square")
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showChatList, setShowChatList] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("current-user")
  const [contacts, setContacts] = useState([
    {
      id: "1",
      name: "Badie dev",
      initials: "BD",
      online: true,
      lastMessage: "👍",
      date: "2023-05-02",
      isYourMessage: true,
      status: "read",
    },
    {
      id: "2",
      name: "mama Ima",
      initials: "MI",
      lastMessage: "hello",
      date: "2023-02-26",
      isYourMessage: true,
      status: "delivered",
    },
    {
      id: "3",
      name: "test User",
      initials: "TU",
      lastMessage: "👍",
      date: "2024-12-12",
      isYourMessage: true,
      status: "delivered",
    },
    {
      id: "4",
      name: "jawad amohoche",
      initials: "JA",
      lastMessage: "hello",
      date: "2024-05-03",
      isYourMessage: false,
    },
    {
      id: "5",
      name: "Marguerite Campbell",
      initials: "MC",
      online: true,
      lastMessage: "Let's discuss the project tomorrow",
      date: "2024-05-01",
      isYourMessage: false,
    },
    {
      id: "6",
      name: "Katrina Winters",
      initials: "KW",
      lastMessage: "Thanks for the update",
      date: "2024-04-30",
      isYourMessage: true,
      status: "read",
    },
    {
      id: "7",
      name: "Miranda Valentine",
      initials: "MV",
      lastMessage: "I'll check and get back to you",
      date: "2024-04-29",
      isYourMessage: false,
    },
  ])
  const [searchQuery, setSearchQuery] = useState("")

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
      if (user.id) {
        setCurrentUserId(user.id)
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }, [navigate])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobileView(mobile)
      if (!mobile) {
        setShowChatList(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle icon click
  const handleIconClick = (iconName) => {
    setActiveIcon(iconName)
  }

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    if (isMobileView) {
      setShowChatList(false)
    }
  }

  // Handle back button in mobile view
  const handleBackToList = () => {
    setShowChatList(true)
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Split contacts into favorites and direct messages
  const favorites = filteredContacts.slice(0, 4)
  const directMessages = filteredContacts.slice(4)

  return (
    <main className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
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
          {/* User icon with direct link to profile page */}
          <NavIcon
            icon="user"
            active={activeIcon === "user"}
            onClick={() => handleIconClick("user")}
            to="/profile" // Direct link to profile page
          />
          <NavIcon
            icon="message-square"
            active={activeIcon === "message-square"}
            onClick={() => handleIconClick("message-square")}
            to="/chat" // Direct link to chat page
          />
          <NavIcon icon="users" active={activeIcon === "users"} onClick={() => handleIconClick("users")} />
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

        {/* Profile picture - now with direct link */}
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
        {/* Chat list sidebar - conditionally shown on mobile */}
        {(showChatList || !isMobileView) && (
          <div className={`${isMobileView ? "w-full" : "w-[320px]"} overflow-y-auto`}>
            <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Chats</h1>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hover:rotate-90 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
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
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-300 focus:shadow-md"
                  />
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
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>

              {/* Chat list content */}
              <div className="flex-1 overflow-y-auto">
                {/* All chats */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        contact={contact}
                        isSelected={selectedChat?.id === contact.id}
                        onClick={() => handleChatSelect(contact)}
                      />
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? `No contacts found for "${searchQuery}"` : "No contacts available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content area - scrollable */}
        {(!showChatList || !isMobileView) && (
          <div className={`${isMobileView ? "w-full" : "flex-1"} overflow-hidden`}>
            {selectedChat ? (
              <ChatDetail chat={selectedChat} onBack={handleBackToList} currentUserId={currentUserId} />
            ) : (
              <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center h-full">
                <div className="text-center max-w-md w-full">
                  <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>

                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Welcome to SoussTalk Chat App
                  </h1>

                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Select a chat from the sidebar or start a new conversation to begin messaging.
                  </p>

                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

// Contact Item Component
function ContactItem({ contact, isSelected, onClick }) {
  return (
    <div
      className={`flex items-center p-3 cursor-pointer ${
        isSelected ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={onClick}
    >
      {/* User avatar */}
      <div className="relative mr-3">
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

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{contact.name}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{contact.date}</span>
        </div>
        <div className="flex items-center">
          {contact.isYourMessage && <span className="text-xs font-medium text-gray-500 mr-1">You:</span>}
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>

          {contact.isYourMessage && (
            <div className="ml-auto pl-2">
              {contact.status === "read" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
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

  // Special animation class for chat icon
  const chatAnimation = icon === "message-square" && active ? "animate-bounce-subtle" : ""

  // Common classes for styling
  const commonClasses = `p-3 rounded-md transition-all duration-300 ${
    active
      ? "text-white bg-green-600 shadow-md transform scale-110"
      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
  } ${chatAnimation}`

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

export default Chat
