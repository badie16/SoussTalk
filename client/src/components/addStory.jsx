import React, { useState, useRef } from 'react';
import { createStory, uploadMedia } from '../services/storyService';
import { useNavigate } from 'react-router-dom';

const AddStory = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let mediaData = null;
      
      if (file) {
        mediaData = await uploadMedia(file);
      }

      await createStory({
        user_id: 1, // À remplacer par l'ID utilisateur réel
        media_url: mediaData?.url || '',
        type: mediaData?.type || 'text',
        caption,
      });
      
      navigate('/stories');
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Story</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="w-full border rounded-xl p-2"
        />
        {preview && (
          file.type.startsWith('video') ? (
            <video src={preview} controls className="w-full max-h-64 rounded" />
          ) : (
            <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded" />
          )
        )}
        <textarea
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border rounded-xl p-2"
        />
        <button
          type="submit"
          disabled={isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
        >
          {isUploading ? 'Posting...' : 'Post Story'}
        </button>
      </form>
    </div>
  );
};

export default AddStory;