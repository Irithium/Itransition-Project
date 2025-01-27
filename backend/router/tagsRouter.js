const router = require("express").Router();
const { authenticateJWT, isAdmin } = require("../middlewares/authMiddleware");
const tagsController = require("../controllers/tagsController");

router.post("/", tagsController.createTags);
router.get("/", tagsController.getTags);
router.get(
  "/:tagId/templates",
  authenticateJWT,
  tagsController.getTemplatesByTag
);
router.put("/:id", authenticateJWT, isAdmin, tagsController.updateTag);
router.delete("/:id", authenticateJWT, isAdmin, tagsController.deleteTag);

module.exports = router;
