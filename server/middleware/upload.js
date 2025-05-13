const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // ou diskStorage

module.exports = upload;
