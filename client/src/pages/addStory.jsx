import React, { useState, useEffect } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

const AddStory = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const type = searchParams.get("type") || "text" // "text" ou "media"

  // Pour media, on récupère le fichier depuis location.state (envoyé depuis Stories.jsx)
  const initialFile = location.state?.file || null

  const [file, setFile] = useState(initialFile)
  const [text, setText] = useState("")
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      if (type === "media" && !file) {
        setError("Please select a file")
        setUploading(false)
        return
      }

      if (type === "text" && !text.trim()) {
        setError("Please enter some text")
        setUploading(false)
        return
      }

      // Simuler envoi (remplace par ta logique upload / API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Ici : envoyer file ou text à ton backend

      // Puis revenir à la liste des stories
      navigate("/stories")
    // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      setError("Failed to upload story")
    } finally {
      setUploading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">
        {type === "media" ? "Add Media Story" : "Add Text Story"}
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {type === "media" && (
          <>
            {previewUrl ? (
              <>
                {file.type.startsWith("image") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mb-4 rounded max-h-64 w-full object-contain"
                  />
                ) : (
                  <video controls className="mb-4 max-h-64 w-full rounded">
                    <source src={previewUrl} type={file.type} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            ) : (
              <p className="mb-4 text-gray-400">No file selected</p>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="mb-4 w-full text-gray-900"
            />
          </>
        )}

        {type === "text" && (
          <textarea
            rows={6}
            className="w-full p-2 rounded bg-gray-800 text-white mb-4 resize-none"
            placeholder="Write your status here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Post Story"}
        </button>
      </form>
    </div>
  )
}

export default AddStory
