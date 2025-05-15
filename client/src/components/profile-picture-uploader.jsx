"use client"

import { useState } from "react"
import { uploadProfilePicture } from "../services/userService"

const ProfilePictureUploader = ({ userId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const imageUrl = await uploadProfilePicture(userId, file)
      if (onUploadComplete) {
        onUploadComplete(imageUrl)
      }
    } catch (error) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label htmlFor="profile-picture-upload" className="cursor-pointer flex items-center justify-center w-full">
        <span className="sr-only">Upload profile picture</span>
        <input
          id="profile-picture-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <div className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">
            {error ? <span className="text-red-500">{error}</span> : <span>Change picture</span>}
          </div>
        )}
      </label>
    </div>
  )
}

export default ProfilePictureUploader
