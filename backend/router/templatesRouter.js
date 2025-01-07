const router = require("express").Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { checkPermissions } = require("../middlewares/permitMiddleware");
const templateController = require("../controllers/templateController");
const { Templates } = require("../models");

router.post("/", authenticateJWT, templateController.createTemplate);
router.get("/", templateController.getTemplates);
router.get(
  "/user/:authorId",
  authenticateJWT,
  templateController.getUserTemplates
);
router.get("/filter", templateController.getFilteredTemplates);
router.get("/search", templateController.searchTemplates);
router.get("/:id", templateController.getTemplateById);
router.put(
  "/:id/update",
  authenticateJWT,
  checkPermissions(Templates),
  templateController.updateTemplate
);
router.put(
  "/:id/access",
  authenticateJWT,
  checkPermissions(Templates),
  templateController.updateAccessSettings
);
router.delete(
  "/:id/delete",
  authenticateJWT,
  checkPermissions(Templates),
  templateController.deleteTemplate
);

module.exports = router;
