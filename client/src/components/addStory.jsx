"use client";

import { useState, useRef } from "react";
import { createStory, uploadMedia } from "../services/storyService";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Type, X, Send } from "lucide-react";

const AddStory = () => {
	const [file, setFile] = useState(null);
	const [caption, setCaption] = useState("");
	const [preview, setPreview] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [activeTab, setActiveTab] = useState("media");
	const [bgColor, setBgColor] = useState(
		"bg-gradient-to-r from-purple-500 to-pink-500"
	);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	const gradients = [
		"bg-gradient-to-r from-purple-500 to-pink-500",
		"bg-gradient-to-r from-blue-500 to-teal-500",
		"bg-gradient-to-r from-green-500 to-yellow-500",
		"bg-gradient-to-r from-red-500 to-orange-500",
		"bg-gradient-to-r from-indigo-500 to-purple-500",
	];

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
			setPreview(URL.createObjectURL(selectedFile));
			setActiveTab("media");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsUploading(true);

		try {
			let mediaData = null;

			if (activeTab === "media" && file) {
				mediaData = await uploadMedia(file);
			}

			await createStory({
				user_id: 1, // À remplacer par l'ID utilisateur réel
				media_url: mediaData?.url || "",
				type:
					activeTab === "media"
						? file?.type.includes("video")
							? "video"
							: "photo"
						: "text",
				caption,
				background: activeTab === "text" ? bgColor : "",
			});

			navigate("/stories");
		} catch (error) {
			console.error("Error:", error.message);
			alert(error.message);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-800 dark:text-white">
					Créer une story
				</h2>
				<button
					onClick={() => navigate("/stories")}
					className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<X size={20} className="text-gray-600 dark:text-gray-400" />
				</button>
			</div>

			<div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
				<button
					className={`py-2 px-4 font-medium flex items-center gap-2 ${
						activeTab === "media"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("media")}
				>
					<ImageIcon size={18} />
					<span>Photos & Vidéos</span>
				</button>
				<button
					className={`py-2 px-4 font-medium flex items-center gap-2 ${
						activeTab === "text"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("text")}
				>
					<Type size={18} />
					<span>Texte</span>
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{activeTab === "media" ? (
					<div className="flex flex-col items-center py-4">
						{preview ? (
							<div className="w-full">
								{file.type.startsWith("video") ? (
									<video
										src={preview}
										controls
										className="max-h-64 w-full rounded-lg object-contain"
									/>
								) : (
									<img
										src={preview || "/placeholder.svg"}
										alt="Preview"
										className="max-h-64 w-full object-contain rounded-lg"
									/>
								)}
								<textarea
									placeholder="Ajouter une légende..."
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
									className="w-full mt-4 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
									rows={2}
								/>
							</div>
						) : (
							<div
								className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer w-full"
								onClick={() => fileInputRef.current.click()}
							>
								<div className="flex flex-col items-center">
									<ImageIcon size={48} className="text-gray-400 mb-2" />
									<p className="text-gray-600 dark:text-gray-400 mb-1">
										Sélectionner une photo ou vidéo
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-500">
										JPG, PNG ou MP4
									</p>
								</div>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									accept="image/*,video/*"
									className="hidden"
								/>
							</div>
						)}
					</div>
				) : (
					<div className="py-4">
						<div className="flex flex-wrap gap-2 mb-4">
							{gradients.map((gradient, index) => (
								<button
									key={index}
									type="button"
									className={`w-8 h-8 rounded-full ${gradient} ${
										bgColor === gradient
											? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
											: ""
									}`}
									onClick={() => setBgColor(gradient)}
								/>
							))}
						</div>
						<div
							className={`w-full h-40 ${bgColor} rounded-lg p-4 flex items-center justify-center mb-4`}
						>
							<textarea
								className="w-full h-full bg-transparent text-white text-center resize-none border-none focus:ring-0 focus:outline-none placeholder-white placeholder-opacity-70"
								placeholder="Écrivez votre message..."
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
							/>
						</div>
					</div>
				)}

				<div className="flex justify-end gap-2 mt-2">
					<button
						type="button"
						className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
						onClick={() => navigate("/stories")}
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={
							isUploading ||
							(activeTab === "media" && !file) ||
							(activeTab === "text" && !caption.trim())
						}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
					>
						{isUploading ? (
							"Publication..."
						) : (
							<>
								<span>Publier</span>
								<Send size={16} />
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default AddStory;
