const router = require("express").Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { checkPermissions } = require("../middlewares/permitMiddleware");
const commentsController = require("../controllers/commentsController");
const { Comments } = require("../models");

router.post("/", authenticateJWT, commentsController.createComment);
router.get(
  "/user/:userId",
  authenticateJWT,
  commentsController.getCommentsByUser
);
router.get(
  "/template/:templateId",
  authenticateJWT,
  commentsController.getCommentsByTemplate
);
router.put(
  "/:id",
  authenticateJWT,
  checkPermissions(Comments),
  commentsController.updateComment
);
router.delete(
  "/:id",
  authenticateJWT,
  checkPermissions(Comments),
  commentsController.deleteComment
);

module.exports = router;
