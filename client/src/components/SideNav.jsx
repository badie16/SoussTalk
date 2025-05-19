"use client"

import { Link } from "react-router-dom"

const SideNav = ({ activeIcon, onIconClick }) => {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[60px] bg-[#1e1e1e] flex flex-col items-center py-6 z-10">
      {/* Top chat icon */}
      <Link to="/chat" className="mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-md flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
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
      </Link>

      {/* Navigation icons */}
      <div className="flex flex-col items-center space-y-8 flex-1">
        <NavIcon icon="user" active={activeIcon === "user"} onClick={() => onIconClick("user")} to="/profile" />
        <NavIcon
          icon="message-square"
          active={activeIcon === "message-square"}
          onClick={() => onIconClick("message-square")}
          to="/chat"
        />
        <NavIcon icon="users" active={activeIcon === "users"} onClick={() => onIconClick("users")} to="/contacts" />
        <NavIcon icon="phone" active={activeIcon === "phone"} onClick={() => onIconClick("phone")} to="/calls" />
        <NavIcon icon="bookmark" active={activeIcon === "bookmark"} onClick={() => onIconClick("bookmark")} to="#" />
        <NavIcon icon="settings" active={activeIcon === "settings"} onClick={() => onIconClick("settings")} to="#" />
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
          <img src="/placeholder.svg" alt="User profile" className="object-cover w-full h-full" />
        </Link>
      </div>
    </div>
  )
}

const NavIcon = ({ icon, to, active, onClick }) => {
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

  return (
    <Link
      to={to}
      className={`p-3 rounded-md transition-all duration-300 ${
        active ? "text-white bg-green-600 shadow-md" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
      }`}
      onClick={onClick}
    >
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
        {getIcon()}
      </svg>
    </Link>
  )
}

export default SideNav
