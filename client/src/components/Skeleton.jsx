/**
 * Composant Skeleton pour afficher une animation de chargement
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.className - Classes CSS additionnelles
 * @param {string} props.width - Largeur du skeleton (ex: "100%", "200px")
 * @param {string} props.height - Hauteur du skeleton (ex: "20px", "2rem")
 * @param {boolean} props.rounded - Si le skeleton doit avoir des coins arrondis
 * @param {boolean} props.circle - Si le skeleton doit être un cercle
 */
const Skeleton = ({
	className = "",
	width,
	height,
	rounded = false,
	circle = false,
}) => {
	const baseClasses = "bg-gray-200 dark:bg-gray-700 animate-pulse";
	const roundedClasses = rounded ? "rounded-md" : "";
	const circleClasses = circle ? "rounded-full" : "";

	const style = {
		width: width || "100%",
		height: height || "20px",
	};

	return (
		<div
			className={`${baseClasses} ${roundedClasses} ${circleClasses} ${className}`}
			style={style}
		/>
	);
};

/**
 * Composant pour afficher un skeleton de texte avec plusieurs lignes
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.lines - Nombre de lignes à afficher
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.lastLineWidth - Largeur de la dernière ligne (en %)
 */
export const TextSkeleton = ({
	lines = 3,
	className = "",
	lastLineWidth = 80,
}) => {
	return (
		<div className={`space-y-2 ${className}`}>
			{Array(lines)
				.fill(0)
				.map((_, index) => (
					<Skeleton
						key={index}
						height="16px"
						rounded
						className={index === lines - 1 ? `w-[${lastLineWidth}%]` : ""}
					/>
				))}
		</div>
	);
};

/**
 * Composant pour afficher un skeleton de carte de profil
 */
export const ProfileCardSkeleton = () => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
			{/* Cover Photo Skeleton */}
			<Skeleton height="80px" />

			<div className="px-6 pb-6">
				{/* Profile Image Skeleton */}
				<div className="relative -mt-10 mb-4 flex justify-start">
					<Skeleton
						width="80px"
						height="80px"
						circle
						className="border-4 border-white dark:border-gray-800"
					/>
				</div>

				{/* User Info Skeleton */}
				<div className="space-y-6">
					{/* Name */}
					<div>
						<Skeleton width="100px" height="12px" rounded className="mb-2" />
						<Skeleton width="180px" height="24px" rounded />
					</div>

					{/* Email */}
					<div>
						<Skeleton width="80px" height="12px" rounded className="mb-2" />
						<div className="flex items-center">
							<Skeleton width="20px" height="20px" circle className="mr-2" />
							<Skeleton width="200px" height="20px" rounded />
						</div>
					</div>

					{/* Phone */}
					<div>
						<Skeleton width="140px" height="12px" rounded className="mb-2" />
						<div className="flex items-center">
							<Skeleton width="20px" height="20px" circle className="mr-2" />
							<Skeleton width="150px" height="20px" rounded />
						</div>
					</div>

					{/* Bio */}
					<div>
						<Skeleton width="60px" height="12px" rounded className="mb-2" />
						<TextSkeleton lines={3} />
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Composant pour afficher un skeleton de section de paramètres
 */
export const SettingsSectionSkeleton = () => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
				<Skeleton width="180px" height="24px" rounded />
				<Skeleton width="60px" height="16px" rounded />
			</div>
			<div className="px-6 py-4">
				<TextSkeleton lines={2} />
			</div>
		</div>
	);
};

/**
 * Composant pour afficher un skeleton d'élément de liste
 */
export const ListItemSkeleton = ({ count = 1 }) => {
	return (
		<div className="space-y-4">
			{Array(count)
				.fill(0)
				.map((_, index) => (
					<div key={index} className="flex items-center py-3">
						<Skeleton width="40px" height="40px" circle className="mr-3" />
						<div className="flex-1">
							<Skeleton width="70%" height="16px" rounded className="mb-2" />
							<Skeleton width="40%" height="12px" rounded />
						</div>
					</div>
				))}
		</div>
	);
};

export default Skeleton;
