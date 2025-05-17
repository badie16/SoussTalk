import React, { useEffect, useRef, useState } from "react";
import { getStories } from "../services/storyService";
import StoryCard from "../components/StoryCard";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaUserCircle } from "react-icons/fa";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    getStories()
      .then(setStories)
      .catch(console.error);
  }, []);

  // Déplacer la définition de handleAddStory avant son utilisation dans le JSX
  const handleAddStory = (type) => {
    setMenuOpen(false);
    if (type === "media") {
      fileInputRef.current.click();
    } else {
      navigate(`/stories/add?type=text`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      navigate("/stories/add?type=media", { state: { file } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Status</h1>

      {/* My Status */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/stories/add")}
        >
          <FaUserCircle className="text-4xl text-gray-300" />
          <div>
            <p className="font-semibold">My status</p>
            <p className="text-sm text-gray-400">Click to add status update</p>
          </div>
        </div>

        <div className="relative">
          <button
            className="text-white text-2xl"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <FaPlusCircle />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50">
              <button
                onClick={() => handleAddStory("media")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                📷 Photos & videos
              </button>
              <button
                onClick={() => handleAddStory("text")}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                ✏️ Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for media */}
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Viewed label */}
      <div className="text-green-500 text-sm font-semibold mb-2 uppercase">Viewed</div>

      {/* Stories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stories.length > 0 ? (
          stories.map((story) => <StoryCard key={story.id} story={story} />)
        ) : (
          <p className="text-gray-500 italic col-span-full">No stories to display.</p>
        )}
      </div>
    </div>
  );
};

export default Stories;