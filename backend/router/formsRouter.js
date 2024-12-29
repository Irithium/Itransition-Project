const router = require("express").Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { checkPermissions } = require("../middlewares/permitMiddleware");
const formsController = require("../controllers/formsController");
const { Forms } = require("../models");

router.post("/", authenticateJWT, formsController.createForm);
router.get(
  "/template/:templateId",
  authenticateJWT,
  formsController.getFormsByTemplate
);
router.get("/user/:userId", authenticateJWT, formsController.getFormsByUser);
router.put(
  "/:id",
  authenticateJWT,
  checkPermissions(Forms),
  formsController.updateForm
);
router.delete(
  "/:id",
  authenticateJWT,
  checkPermissions(Forms),
  formsController.deleteForm
);

module.exports = router;
