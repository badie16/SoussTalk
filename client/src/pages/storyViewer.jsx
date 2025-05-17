import React from "react";

const StoryViewer = ({ story }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {story.type === "text" ? (
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-40 flex items-center justify-center p-4">
          <p className="text-white text-center">{story.caption}</p>
        </div>
      ) : story.type === "video" ? (
        <video 
          src={story.media_url} 
          controls 
          className="w-full h-40 object-cover"
        />
      ) : (
        <img 
          src={story.media_url} 
          alt={story.caption || "Story"} 
          className="w-full h-40 object-cover"
        />
      )}
      {story.caption && (
        <p className="p-2 text-sm text-gray-700 truncate">{story.caption}</p>
      )}
    </div>
  );
};

export default StoryViewer;