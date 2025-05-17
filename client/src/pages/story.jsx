import React, { useState, useRef, useEffect } from "react";
import { UserCircle } from "lucide-react";
import {
	getActiveStories,
	createStory,
	uploadMedia,
} from "../services/storyService";
import StoryViewer from "../pages/storyViewer";
import SideNav from "../components/SideNav";
const Stories = () => {
	const [stories, setStories] = useState([]);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [textContent, setTextContent] = useState("");
	const [activeTab, setActiveTab] = useState("media");
	const fileInputRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [activeIcon, setActiveIcon] = useState("users");

	useEffect(() => {
		fetchStories();
	}, []);

	const fetchStories = async () => {
		try {
			const res = await getActiveStories();
			if (res.success) {
				setStories(Array.isArray(res.data) ? res.data : []);
			} else {
				console.error("Erreur récupération stories:", res.message);
			}
		} catch (error) {
			console.error("Erreur fetchStories:", error);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
			setActiveTab("media");
			setShowAddMenu(true);
		}
	};

	const handleAddStory = async () => {
		if (
			(activeTab === "media" && !selectedFile) ||
			(activeTab === "text" && !textContent.trim())
		) {
			return;
		}

		setLoading(true);
		try {
			let mediaUrl = "";
			let type = "text";

			if (activeTab === "media" && selectedFile) {
				mediaUrl = await uploadMedia(selectedFile);
				type = selectedFile.type.includes("video") ? "video" : "photo";
			}

			await createStory({
				user_id: 1,
				media_url: activeTab === "media" ? mediaUrl : "",
				type,
				caption: textContent,
			});

			setSelectedFile(null);
			setTextContent("");
			setShowAddMenu(false);
			fetchStories();
		} catch (error) {
			console.error("Error creating story:", error);
		} finally {
			setLoading(false);
		}
	};
	// Gérer le clic sur une icône
	const handleIconClick = (iconName) => {
		setActiveIcon(iconName);
	};
	return (
		<main className="flex h-screen bg-gray-100 dark:bg-gray-900  themed-page overflow-hidden">
			{/* Barre latérale de navigation */}
			<SideNav activeIcon={activeIcon} onIconClick={handleIconClick} />
      
			<div className="flex flex-1 ml-[60px]">
				<div className="w-full max-w-5xl mx-auto px-4 py-6">
					<div className="bg-gray-800 rounded-lg shadow p-4 mb-4">
						<h1 className="text-2xl font-bold">Status</h1>

						<div
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
							onClick={() => {
								setActiveTab("text");
								setShowAddMenu(true);
							}}
						>
							<UserCircle className="text-4xl text-gray-400" />
							<div>
								<p className="font-semibold">My status</p>
								<p className="text-sm text-gray-400">
									Click to add status update
								</p>
							</div>
						</div>
					</div>

					{showAddMenu && (
						<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
							<div className="bg-gray-800 rounded-lg w-full max-w-md p-4">
								<div className="flex border-b border-gray-600 mb-4">
									<button
										className={`py-2 px-4 font-medium ${
											activeTab === "media"
												? "text-blue-400 border-b-2 border-blue-400"
												: "text-gray-400"
										}`}
										onClick={() => setActiveTab("media")}
									>
										Photos & videos
									</button>
									<button
										className={`py-2 px-4 font-medium ${
											activeTab === "text"
												? "text-blue-400 border-b-2 border-blue-400"
												: "text-gray-400"
										}`}
										onClick={() => setActiveTab("text")}
									>
										Text
									</button>
								</div>

								{activeTab === "media" ? (
									<div className="flex flex-col items-center py-8">
										{selectedFile ? (
											selectedFile.type.includes("video") ? (
												<video
													src={URL.createObjectURL(selectedFile)}
													controls
													className="max-h-64 w-full rounded"
												/>
											) : (
												<img
													src={URL.createObjectURL(selectedFile)}
													alt="Preview"
													className="max-h-64 w-full object-contain rounded"
												/>
											)
										) : (
											<div
												className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer"
												onClick={() => fileInputRef.current.click()}
											>
												<p className="text-gray-400">Select photo or video</p>
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
									<textarea
										className="w-full h-40 p-3 border border-gray-600 bg-gray-900 text-white rounded-lg"
										placeholder="Write your text status..."
										value={textContent}
										onChange={(e) => setTextContent(e.target.value)}
									/>
								)}

								<div className="flex justify-end gap-2 mt-4">
									<button
										className="px-4 py-2 text-gray-300 hover:text-white"
										onClick={() => setShowAddMenu(false)}
									>
										Cancel
									</button>
									<button
										className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
										onClick={handleAddStory}
										disabled={
											loading ||
											(activeTab === "media" && !selectedFile) ||
											(activeTab === "text" && !textContent.trim())
										}
									>
										{loading ? "Posting..." : "Post"}
									</button>
								</div>
							</div>
						</div>
					)}

					<div className="bg-gray-800 rounded-lg shadow p-4">
						<p className="text-green-400 font-medium mb-2">VIEWED</p>

						{stories.length > 0 ? (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
								{stories.map((story) => (
									<StoryViewer key={story.id} story={story} />
								))}
							</div>
						) : (
							<p className="text-gray-400 text-center py-8">
								No viewed stories
							</p>
						)}
					</div>
				</div>
			</div>
		</main>
	);
};

export default Stories;
