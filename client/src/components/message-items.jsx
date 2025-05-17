import { Check } from "lucide-react"

const MessageItem = ({ message, isOwn }) => {
  // Format the timestamp
  const formattedDate = message.timestamp ? new Date(message.timestamp).toLocaleDateString() : ""

  return (
    <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {/* Sender name - only show for others' messages */}
        {!isOwn && <span className="text-xs text-gray-500 mb-1 font-medium">{message.sender.name}</span>}

        {/* Message content */}
        <div
          className={`rounded-lg px-4 py-2 inline-block ${
            isOwn
              ? "bg-green-500 text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Message info */}
        <div className="flex items-center mt-1 text-xs text-gray-500">
          {/* Date */}
          <span>{formattedDate}</span>

          {/* Status indicators - only for own messages */}
          {isOwn && (
            <div className="flex items-center ml-2">
              <span className="mr-1 font-medium">You:</span>
              {message.status === "delivered" ? (
                <Check size={14} className="text-gray-500" />
              ) : message.status === "read" ? (
                <Check size={14} className="text-blue-500" />
              ) : (
                <Check size={14} className="text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

     
    </div>
  )
}

export default MessageItem
