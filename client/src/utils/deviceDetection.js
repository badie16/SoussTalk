// Utilitaire pour détecter les informations sur l'appareil et le navigateur

// Fonction pour obtenir des informations détaillées sur l'appareil
export const getDeviceInfo = async () => {
	try {
		// Basic information about browser and device
		const userAgent = navigator.userAgent || "Unknown";
		const platform = navigator.platform || "Unknown";
		const language = navigator.language || "Unknown";
		const screenWidth = window.screen?.width || 0;
		const screenHeight = window.screen?.height || 0;
		const pixelRatio = window.devicePixelRatio || 1;
		const timeZone =
			Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";

		// Device type detection
		const isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				userAgent
			);
		const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(
			userAgent.toLowerCase()
		);
		const isDesktop = !isMobile && !isTablet;

		// Browser detection
		let browserName = "Unknown";
		let browserVersion = "Unknown";

		if (userAgent.indexOf("Firefox") > -1) {
			browserName = "Firefox";
			browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
		} else if (
			userAgent.indexOf("Chrome") > -1 &&
			userAgent.indexOf("Edg") === -1 &&
			userAgent.indexOf("OPR") === -1
		) {
			browserName = "Chrome";
			browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
		} else if (
			userAgent.indexOf("Safari") > -1 &&
			userAgent.indexOf("Chrome") === -1
		) {
			browserName = "Safari";
			browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
		} else if (userAgent.indexOf("Edg") > -1) {
			browserName = "Edge";
			browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "Unknown";
		} else if (userAgent.indexOf("OPR") > -1) {
			browserName = "Opera";
			browserVersion = userAgent.match(/OPR\/([0-9.]+)/)?.[1] || "Unknown";
		}

		// OS detection
		let osName = "Unknown";
		let osVersion = "Unknown";

		if (userAgent.indexOf("Windows") > -1) {
			osName = "Windows";
			osVersion = userAgent.match(/Windows NT ([0-9.]+)/)?.[1] || "Unknown";
			if (osVersion === "10.0") osVersion = "10/11";
			else if (osVersion === "6.3") osVersion = "8.1";
			else if (osVersion === "6.2") osVersion = "8";
			else if (osVersion === "6.1") osVersion = "7";
		} else if (userAgent.indexOf("Mac") > -1) {
			osName = "macOS";
			osVersion =
				userAgent.match(/Mac OS X ([0-9_.]+)/)?.[1]?.replace(/_/g, ".") ||
				"Unknown";
		} else if (userAgent.indexOf("Android") > -1) {
			osName = "Android";
			osVersion = userAgent.match(/Android ([0-9.]+)/)?.[1] || "Unknown";
		} else if (
			userAgent.indexOf("iOS") > -1 ||
			userAgent.indexOf("iPhone") > -1 ||
			userAgent.indexOf("iPad") > -1
		) {
			osName = "iOS";
			osVersion =
				userAgent.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, ".") || "Unknown";
		} else if (userAgent.indexOf("Linux") > -1) {
			osName = "Linux";
		}

		// Attempt to get approximate location (country only)
		let location = "Unknown";
		try {
			const response = await fetch("https://ipapi.co/json/", {
				method: "GET",
				headers: { Accept: "application/json" },
				timeout: 3000, // 3 second timeout
			});
			if (response.ok) {
				const data = await response.json();
				location =
					data.city && data.country_name
						? `${data.city}, ${data.country_name}`
						: data.country_name || "Unknown";
			}
		} catch (error) {
			console.warn("Could not get location:", error);
		}

		// Friendly device name
		const deviceName = isDesktop
			? `${osName} ${browserName}`
			: isMobile
			? `Mobile ${osName}`
			: `Tablet ${osName}`;

		return {
			deviceName,
			deviceType: isDesktop ? "Desktop" : isMobile ? "Mobile" : "Tablet",
			browserName,
			browserVersion,
			osName,
			osVersion,
			userAgent,
			platform,
			language,
			screenResolution: `${screenWidth}x${screenHeight} (${pixelRatio}x)`,
			timeZone,
			location,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error detecting device:", error);
		// Return a minimal fallback object
		return {
			deviceName: "Unknown Device",
			deviceType: "Unknown",
			userAgent: navigator.userAgent || "Unknown",
			timestamp: new Date().toISOString(),
		};
	}
};

// Fonction pour formater la durée depuis une date
export const formatTimeSince = (dateString) => {
	try {
		if (!dateString) return "Date inconnue";

		const date = new Date(dateString);
		const now = new Date();

		// Vérifier si la date est valide
		if (isNaN(date.getTime())) return "Date invalide";

		const seconds = Math.floor((now - date) / 1000);

		if (seconds < 60) return "à l'instant";

		const minutes = Math.floor(seconds / 60);
		if (minutes < 60)
			return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;

		const days = Math.floor(hours / 24);
		if (days < 30) return `il y a ${days} jour${days > 1 ? "s" : ""}`;

		const months = Math.floor(days / 30);
		if (months < 12) return `il y a ${months} mois`;

		const years = Math.floor(months / 12);
		return `il y a ${years} an${years > 1 ? "s" : ""}`;
	} catch (error) {
		console.error("Erreur lors du formatage de la date:", error);
		return "Date inconnue";
	}
};

export default {
	getDeviceInfo,
	formatTimeSince,
};
