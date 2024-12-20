const router = require("express").Router();
const {
  authenticateJWT,
  isAdmin,
} = require("../middlewares/authMiddleware.js");
const userController = require("../controllers/usersController.js");

router.get("/current", authenticateJWT, userController.getCurrentUser);
router.put("/current/update", authenticateJWT, userController.updateUser);
router.get("/search", authenticateJWT, userController.searchUsers);

router.get("/", authenticateJWT, isAdmin, userController.getAllUsers);
router.get("/:id", authenticateJWT, isAdmin, userController.getUserById);
router.put(
  "/:id/update",
  authenticateJWT,
  isAdmin,
  userController.updateUserById
);
router.put(
  "/admin/:id/:action",
  authenticateJWT,
  isAdmin,
  userController.updateAdminStatus
);
router.put(
  "/status/:id/:action",
  authenticateJWT,
  isAdmin,
  userController.updateBlockStatus
);
router.delete(
  "/:id/delete",
  authenticateJWT,
  isAdmin,
  userController.deleteUser
);

module.exports = router;
