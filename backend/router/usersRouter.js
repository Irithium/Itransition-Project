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
router.put("/update/:id", authenticateJWT, userController.updateUserById);
router.put(
  "/admin/:action",
  authenticateJWT,
  isAdmin,
  userController.updateAdminStatus
);
router.put(
  "/status/:action",
  authenticateJWT,
  isAdmin,
  userController.updateBlockStatus
);
router.delete("/", authenticateJWT, isAdmin, userController.deleteUser);

module.exports = router;
