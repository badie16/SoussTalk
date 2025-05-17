
import React from "react";

const StoryCard = ({ story }) => {
  const { media_url, caption, created_at, expires_at } = story;
  const timeLeft = Math.max(0, new Date(expires_at) - new Date());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const publishedAt = new Date(created_at).toLocaleString();

  return (
    <div className="bg-white shadow-md rounded-2xl p-4">
      <img
        src={media_url}
        alt="story"
        className="w-full h-60 object-cover rounded-xl mb-2"
      />
      <p className="font-semibold">{caption}</p>
      <p className="text-sm text-gray-500">Expire dans {hoursLeft}h</p>
      <p className="text-sm text-gray-400">Publié le {publishedAt}</p>
    </div>
  );
};

export default StoryCard;