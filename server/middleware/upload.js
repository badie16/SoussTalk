const multer = require("multer");
// Configuration pour l'upload de fichiers
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
		);
	},
});
const allowedMimeTypes = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"audio/mpeg",
	"audio/wav",
	"audio/webm",
	"audio/ogg",
	"audio/opus",
	"video/mp4",
	"video/webm",
	"video/ogg",
];

const allowedExtensions = [
	".jpeg",
	".jpg",
	".png",
	".gif",
	".pdf",
	".doc",
	".docx",
	".mp3",
	".mp4",
	".wav",
	".opus",
	".webm",
	".ogg",
];
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB
	},
	fileFilter: (req, file, cb) => {
		console.log("Original Name:", file.originalname);
		console.log("Mimetype:", file.mimetype);

		const ext = path.extname(file.originalname).toLowerCase();

		const isMimeTypeOk = allowedMimeTypes.includes(file.mimetype);
		const isExtOk = allowedExtensions.includes(ext);

		if (isMimeTypeOk && isExtOk) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type"));
		}
	},
});
module.exports = upload;
