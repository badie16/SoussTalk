import React from "react";

export default function Loading({ text = "Chargement...", fullScreen = true }) {
	if (fullScreen) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
				<div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mb-4"></div>
				<div className="text-xl text-gray-700">{text}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-8">
			<div className="w-10 h-10 border-t-3 border-green-500 border-solid rounded-full animate-spin mb-3"></div>
			<div className="text-lg text-gray-700">{text}</div>
		</div>
	);
}
