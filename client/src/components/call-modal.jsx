"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react"
import { endCall, formatDuration } from "../services/callService"

const CallModal = ({ call, onClose }) => {
  const [callStatus, setCallStatus] = useState("connecting") // connecting, ongoing, ended
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  // Play ringing sound when call is connecting
  useEffect(() => {
    if (callStatus === "connecting") {
      // In a real app, you would play a ringing sound here
      // For now, we'll simulate the call connecting after 2 seconds
      const connectTimeout = setTimeout(() => {
        setCallStatus("ongoing")

        // Start the call timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1)
        }, 1000)
      }, 2000)

      return () => {
        clearTimeout(connectTimeout)
      }
    }
  }, [callStatus])

  // Clean up timer when component unmounts or call ends
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Handle call end
  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setCallStatus("ended")

    // Update call history
    const updatedCall = endCall(call, duration)

    // Close the modal after a short delay
    setTimeout(() => {
      onClose(updatedCall)
    }, 1000)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real app, you would mute the audio here
  }

  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
    // In a real app, you would toggle the speaker here
  }

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-md mx-auto">
        {/* Close button in the top-right corner */}
        <button onClick={handleEndCall} className="absolute top-2 right-2 text-gray-400 hover:text-white z-10">
          <X size={24} />
        </button>

        {/* Call modal with dark blue background */}
        <div className="bg-[#1a2550] rounded-lg overflow-hidden shadow-2xl">
          {/* Call content */}
          <div className="flex flex-col items-center justify-center p-8 pt-12">
            {/* Avatar circle with green background */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-semibold">
                {call.avatar ? (
                  <img
                    src={call.avatar || "/placeholder.svg"}
                    alt={call.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(call.name)
                )}
              </div>
            </div>

            {/* Caller name */}
            <h2 className="text-xl font-semibold text-white mb-2">{call.name}</h2>

            {/* Call status/duration */}
            <p className="text-gray-300 mb-8">
              {callStatus === "connecting" ? (
                <span className="flex items-center">
                  Connecting
                  <span className="ml-2 flex space-x-1">
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    ></span>
                  </span>
                </span>
              ) : (
                formatDuration(duration)
              )}
            </p>

            {/* Call actions */}
            <div className="flex justify-center space-x-6 mb-4">
              {/* Only show mute and speaker buttons during ongoing call */}
              {callStatus === "ongoing" && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button
                    onClick={toggleSpeaker}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSpeakerOn ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-red-500 text-white"
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                </>
              )}
            </div>

            {/* End call button */}
            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              <Phone size={24} className="transform rotate-135" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallModal
