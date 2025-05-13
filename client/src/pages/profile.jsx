"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2, Camera, Check, X } from "lucide-react"
import "../index.css"

const Profile = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    name: "User Name",
    email: "user@example.com",
    phone: "+1 234 567 890",
    bio: "No bio available",
    profileImage: "/placeholder.svg",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    name: "User Name",
    email: "user@example.com",
    phone: "+1 234 567 890",
    bio: "No bio available",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load user data on component mount
  useEffect(() => {
    // Simple function to load user data
    const loadUserData = () => {
      try {
        const storedData = localStorage.getItem("userData")
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          const newUserData = {
            name: parsedData.name || "User Name",
            email: parsedData.email || "user@example.com",
            phone: parsedData.phone || "+1 234 567 890",
            bio: parsedData.bio || "No bio available",
            profileImage: parsedData.profileImage || "/placeholder.svg",
          }
          setUserData(newUserData)
          setEditedData({
            name: newUserData.name,
            email: newUserData.email,
            phone: newUserData.phone,
            bio: newUserData.bio,
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()
  }, []) // Empty dependency array - only run once on mount

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
      })
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        alert("Image size should be less than 1MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result) {
          setUserData((prev) => ({
            ...prev,
            profileImage: result,
          }))

          // Also update in localStorage
          try {
            const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
            storedUserData.profileImage = result
            localStorage.setItem("userData", JSON.stringify(storedUserData))
          } catch (error) {
            console.error("Error updating profile image in localStorage:", error)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      try {
        // Update userData state
        setUserData((prev) => ({
          ...prev,
          ...editedData,
        }))

        // Update localStorage
        const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
        const updatedUserData = {
          ...storedUserData,
          ...editedData,
        }
        localStorage.setItem("userData", JSON.stringify(updatedUserData))

        setIsEditing(false)
      } catch (error) {
        console.error("Error saving profile changes:", error)
        alert("Failed to save changes. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 1000)
  }

  // Safe navigation back to chat
  const handleBackToChat = () => {
    navigate("/chat")
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={handleBackToChat}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h1>
          <div className="ml-auto">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleEditToggle}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  <X size={20} className="text-red-500" />
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check size={20} className="text-green-500" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditToggle}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit2 size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-green-400 to-green-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Profile Image */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={userData.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-green-600 transition-colors"
              >
                <Camera size={18} />
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{userData.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center">
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
                      className="text-gray-500 dark:text-gray-400 mr-2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <p className="text-gray-800 dark:text-gray-200">{userData.email}</p>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center">
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
                      className="text-gray-500 dark:text-gray-400 mr-2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <p className="text-gray-800 dark:text-gray-200">{userData.phone}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editedData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  ></textarea>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{userData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Account Settings</h2>
          </div>
          <div className="px-6 py-4">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              <SettingsItem icon="lock" title="Privacy and Security" />
              <SettingsItem icon="bell" title="Notifications" />
              <SettingsItem icon="moon" title="Appearance" />
              <SettingsItem icon="help-circle" title="Help and Support" />
              <SettingsItem
                icon="log-out"
                title="Logout"
                danger
                onClick={() => {
                  localStorage.removeItem("userData")
                  navigate("/login")
                }}
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Item Component
const SettingsItem = ({ icon, title, danger = false, onClick }) => {
  const getIcon = () => {
    switch (icon) {
      case "lock":
        return <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"></path>
      case "bell":
        return (
          <>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </>
        )
      case "moon":
        return <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      case "help-circle":
        return (
          <>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </>
        )
      case "log-out":
        return (
          <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </>
        )
      default:
        return null
    }
  }

  return (
    <li className="py-3">
      <button
        onClick={onClick}
        className={`flex items-center w-full text-left transition-colors ${
          danger
            ? "text-red-500 hover:text-red-600"
            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
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
            {getIcon()}
          </svg>
        </div>
        <span className="font-medium">{title}</span>
        {!danger && (
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
            className="ml-auto text-gray-400"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        )}
      </button>
    </li>
  )
}

export default Profile