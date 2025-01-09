const router = require("express").Router();
const uploadController = require("../controllers/uploadController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { authenticateJWT } = require("../middlewares/authMiddleware");

router.post("/", upload.single("file"), uploadController.uploadImage);

module.exports = router;
