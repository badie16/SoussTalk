"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ChatSidebar from "../components/chat-sidebar"
import ChatList from "../components/chat-list"
import ChatDetail from "../components/chat-detail"
import { getCurrentUser } from "../services/authService"

const ChatPage = () => {
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showChatList, setShowChatList] = useState(true)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=40&width=40")

  // Check if user is logged in and load user data
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate("/login")
      return
    }

    // Set profile image if available
    if (user.profileImage) {
      setProfileImage(user.profileImage)
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

  return (
    <main className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Main navigation sidebar - fixed position */}
      <ChatSidebar profileImage={profileImage} />

      {/* Content area - with left margin to account for fixed sidebar */}
      <div className="flex flex-1 ml-[60px]">
        {/* Chat list sidebar - conditionally shown on mobile */}
        {(showChatList || !isMobileView) && (
          <div className={`${isMobileView ? "w-full" : "w-[320px]"} overflow-y-auto`}>
            <ChatList onSelectChat={handleChatSelect} selectedChatId={selectedChat?.id} />
          </div>
        )}

        {/* Chat detail area - conditionally shown on mobile */}
        {(!showChatList || !isMobileView) && (
          <div className={`${isMobileView ? "w-full" : "flex-1"} overflow-hidden`}>
            <ChatDetail chat={selectedChat} onBack={handleBackToList} />
          </div>
        )}
      </div>
    </main>
  )
}

export default ChatPage
