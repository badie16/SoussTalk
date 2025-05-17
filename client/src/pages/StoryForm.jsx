// src/pages/StoryForm.jsx
import React, { useState, useEffect } from "react";
import { createStory, uploadMedia } from "../services/storyService";

const StoryForm = ({ onSuccess, editingStory, resetEditing }) => {
  const [formData, setFormData] = useState({
    user_id: 1, // À remplacer plus tard
    media_url: "",
    type: "text",
    caption: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingStory) {
      setFormData({
        user_id: editingStory.user_id,
        media_url: editingStory.media_url,
        type: editingStory.type,
        caption: editingStory.caption
      });
    }
  }, [editingStory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mediaUrl = formData.media_url;

      if (formData.type !== "text" && selectedFile) {
        const uploadRes = await uploadMedia(selectedFile);
        if (!uploadRes.success) throw new Error(uploadRes.message);

        mediaUrl = uploadRes.data.url || uploadRes.data;
      }

      const storyToSend = {
        ...formData,
        media_url: mediaUrl
      };

      await createStory(storyToSend);
      onSuccess();

      setFormData({
        user_id: 1,
        media_url: "",
        type: "text",
        caption: ""
      });
      setSelectedFile(null);

      if (editingStory) resetEditing();
    } catch (err) {
      setError(err.message || "Une erreur s’est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {editingStory ? "Edit Story" : "Create New Story"}
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="text">Text</option>
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
        </div>

        {formData.type !== "text" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Media File</label>
            <input
              type="file"
              accept={formData.type === "photo" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              className="w-full border rounded p-2"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Caption</label>
          <textarea
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows="3"
            placeholder="Enter your story caption"
          />
        </div>

        <div className="flex justify-end">
          {editingStory && (
            <button
              type="button"
              onClick={resetEditing}
              className="mr-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : editingStory ? "Update Story" : "Create Story"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;
