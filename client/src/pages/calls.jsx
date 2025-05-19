"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import "../index.css"
import { initiateCall, getCallHistory } from "../services/callService"
import CallModal from "../components/call-modal"
import SideNav from "../components/SideNav"

const Calls = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [callHistory, setCallHistory] = useState([])
  const [activeTab, setActiveTab] = useState("recent") // 'recent' or 'missed'
  const [activeIcon, setActiveIcon] = useState("phone")

  // Call state
  const [showCallModal, setShowCallModal] = useState(false)
  const [currentCall, setCurrentCall] = useState(null)

  // Handle icon click
  const handleIconClick = (iconName) => {
    setActiveIcon(iconName)

    if (iconName === "message-square") {
      navigate("/chat")
    } else if (iconName === "users") {
      navigate("/contacts")
    } else if (iconName === "user") {
      navigate("/profile")
    }
  }

  // Check if user is logged in and load call history
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)

      // Check for user authentication
      const userData = localStorage.getItem("user")
      if (!userData) {
        navigate("/login")
        return
      }

      try {
        // Get call history
        const history = getCallHistory()
        setCallHistory(history)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  // Handle call initiation
  const handleCallContact = async (contact, callType = "audio") => {
    try {
      // Initiate the call
      const call = await initiateCall(contact, callType)

      // Set the current call
      setCurrentCall(call)

      // Show the call modal
      setShowCallModal(true)
    } catch (error) {
      console.error("Error initiating call:", error)
    }
  }

  // Handle call end
  const handleCallEnd = (call) => {
    setShowCallModal(false)
    setCurrentCall(null)

    // Refresh call history
    setCallHistory(getCallHistory())
  }

  // Filter call history based on search query and active tab
  const filteredCallHistory = callHistory.filter((call) => {
    const matchesSearch = call.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === "missed") {
      return call.missed
    }

    return true
  })

  return (
    <div className="flex h-screen bg-[#1a2236]">
      {/* Left sidebar with icons */}
      <SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />

      {/* Main content */}
      <div className="flex flex-1 ml-[60px]">
        {/* Calls list */}
        <div className="w-[400px] bg-[#1a2550]">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-semibold text-white">Calls</h1>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2a3447] text-gray-300">
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a3447] text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 border-b border-[#2a3447]">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "recent"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("recent")}
            >
              Recent
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "missed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("missed")}
            >
              Missed
            </button>
          </div>

          {/* Call History */}
          <div className="overflow-y-auto h-[calc(100vh-180px)]">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCallHistory.length > 0 ? (
              filteredCallHistory.map((call) => (
                <CallHistoryItem
                  key={call.id}
                  call={call}
                  onCall={() => handleCallContact({ ...call }, "audio")}
                  onVideoCall={() => handleCallContact({ ...call }, "video")}
                  onChat={() => navigate("/chat", { state: { selectedContact: call } })}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {searchQuery
                    ? `No calls found for "${searchQuery}"`
                    : activeTab === "missed"
                      ? "No missed calls"
                      : "No recent calls"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Welcome screen */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6">
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

            <h1 className="text-2xl font-semibold text-gray-200 mb-4">Welcome to SoussTalk Chat App</h1>

            <p className="text-gray-400 mb-8">
              Select a chat from the sidebar or start a new conversation to begin messaging.
            </p>

            <button
              onClick={() => navigate("/chat")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md transition-all duration-300 hover:shadow-lg"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && currentCall && <CallModal call={currentCall} onClose={handleCallEnd} />}
    </div>
  )
}

// Call History Item Component
const CallHistoryItem = ({ call, onCall, onVideoCall, onChat }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-[#2a3447]">
      {/* User avatar */}
      <div className="flex items-center flex-1">
        <div className="relative mr-3">
          {call.avatar ? (
            <img
              src={call.avatar || "/placeholder.svg"}
              alt={call.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <span className="font-medium">{call.initials}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{call.name}</p>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400 mr-1"
            >
              <polyline points="9 10 4 15 9 20"></polyline>
              <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
            </svg>
            <span className="text-xs text-gray-400">
              {call.timestamp} • {call.duration || "00:00"}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onCall}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a3447] text-gray-300"
        >
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
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
        <button
          onClick={onVideoCall}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a3447] text-gray-300"
        >
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
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button
          onClick={onChat}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white"
        >
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
          >
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Calls
