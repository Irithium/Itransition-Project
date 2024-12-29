const router = require("express").Router();
const { authenticateJWT, isAdmin } = require("../middlewares/authMiddleware");
const tagsController = require("../controllers/tagsController");

router.get("/", tagsController.getTags);
router.get("/:tagId/templates", tagsController.getTemplatesByTag);
router.put("/:id", authenticateJWT, isAdmin, tagsController.updateTag);
router.delete("/:id", authenticateJWT, isAdmin, tagsController.deleteTag);

module.exports = router;
