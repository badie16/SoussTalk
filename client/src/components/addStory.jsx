// components/AddStory.jsx
import React, { useState } from "react";
import { postStory } from "../services/storyService";
import { useNavigate } from "react-router-dom";

const AddStory = () => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postStory({
        user_id: 1, // à adapter selon l'authentification réelle
        media_url: mediaUrl,
        caption,
      });
      navigate("/stories");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la story:", err);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ajouter une Story</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="URL de l'image"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="w-full border rounded-xl p-2"
          required
        />
        <textarea
          placeholder="Caption (optionnel)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border rounded-xl p-2"
        ></textarea>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Publier
        </button>
      </form>
    </div>
  );
};

export default AddStory;
