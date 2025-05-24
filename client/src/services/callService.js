// Call service to handle call-related functionality

// Get call history from localStorage
export const getCallHistory = () => {
  try {
    const callHistory = localStorage.getItem("call_history")
    return callHistory ? JSON.parse(callHistory) : generateSampleCallHistory()
  } catch (error) {
    console.error("Error getting call history:", error)
    return generateSampleCallHistory()
  }
}

// Add a new call to history
export const addCallToHistory = (call) => {
  try {
    const callHistory = getCallHistory()

    // Add the new call at the beginning of the array
    const updatedHistory = [
      {
        id: `call-${Date.now()}`,
        ...call,
        date: new Date(),
        timestamp: formatCallTime(new Date()),
      },
      ...callHistory,
    ]

    // Limit history to 100 calls to prevent localStorage from getting too large
    const limitedHistory = updatedHistory.slice(0, 100)

    // Save to localStorage
    localStorage.setItem("call_history", JSON.stringify(limitedHistory))

    return limitedHistory
  } catch (error) {
    console.error("Error adding call to history:", error)
    return []
  }
}

// Format call time for display
export const formatCallTime = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date >= today) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (date >= yesterday) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else {
    // Check if it's within the last week
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    if (date >= lastWeek) {
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }
}

// Initiate a call
export const initiateCall = async (contact, callType = "audio") => {
  // In a real app, this would connect to a WebRTC service or similar
  // For now, we'll just simulate a call and add it to history

  // Create a call record
  const call = {
    id: `call-${Date.now()}`,
    name: contact.name,
    initials: contact.initials || getInitials(contact.name),
    avatar: contact.avatar,
    type: "outgoing",
    callType: callType, // "audio" or "video"
    duration: "00:00", // Will be updated when call ends
    missed: false,
    timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date(),
  }

  // Return the call object to be used by the call modal
  return call
}

// End a call and update history
export const endCall = (call, duration) => {
  // Update the call with duration
  const updatedCall = {
    ...call,
    duration: formatDuration(duration),
    endTime: new Date(),
  }

  // Add to history
  addCallToHistory(updatedCall)

  return updatedCall
}

// Format duration in seconds to mm:ss
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "??"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Generate sample call history for demonstration
const generateSampleCallHistory = () => {
  const contacts = [
    { id: "1", name: "Badie dev", initials: "BD", avatar: null, online: true },
    { id: "2", name: "Marguerite Campbell", initials: "MC", avatar: null, online: true },
    { id: "3", name: "mama Ima", initials: "MI", avatar: null, online: false },
    { id: "4", name: "test User", initials: "TU", avatar: null, online: false },
    { id: "5", name: "jawad amohoche", initials: "JA", avatar: null, online: false },
  ]

  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 6)

  return [
    {
      id: "call-1",
      name: "Badie dev",
      initials: "BD",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:00",
      missed: false,
      timestamp: "Today, 07:53 PM",
      date: new Date(now.setHours(19, 53)),
    },
    {
      id: "call-2",
      name: "Badie dev",
      initials: "BD",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:00",
      missed: false,
      timestamp: "Today, 07:47 PM",
      date: new Date(now.setHours(19, 47)),
    },
    {
      id: "call-3",
      name: "Marguerite Campbell",
      initials: "MC",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:01",
      missed: false,
      timestamp: "Today, 07:47 PM",
      date: new Date(now.setHours(19, 47)),
    },
    {
      id: "call-4",
      name: "Marguerite Campbell",
      initials: "MC",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:01",
      missed: false,
      timestamp: "Today, 07:47 PM",
      date: new Date(now.setHours(19, 47)),
    },
    {
      id: "call-5",
      name: "Badie dev",
      initials: "BD",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:00",
      missed: false,
      timestamp: "Today, 07:47 PM",
      date: new Date(now.setHours(19, 47)),
    },
    {
      id: "call-6",
      name: "Badie dev",
      initials: "BD",
      avatar: null,
      type: "outgoing",
      callType: "audio",
      duration: "00:01",
      missed: false,
      timestamp: "Today, 04:11 PM",
      date: new Date(now.setHours(16, 11)),
    },
  ]
}
