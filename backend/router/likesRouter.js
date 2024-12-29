const router = require("express").Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const likesController = require("../controllers/likesController");

router.post("/:type/:id", authenticateJWT, likesController.createLike);
router.delete("/:type/:id", authenticateJWT, likesController.deleteLike);
router.get("/templates", authenticateJWT, likesController.getTemplatesByLikes);

module.exports = router;
