import { useEffect, useState } from "react";
import { fetchTest } from "./api";

export default function App() {
	const [message, setMessage] = useState("");
	useEffect(() => {
		fetchTest().then(setMessage);
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-red-100">
			<h1 className="text-3xl font-bold">{message || "hors server..."}</h1>
		</div>
	);
}
