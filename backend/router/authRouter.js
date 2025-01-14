const router = require("express").Router();
const authController = require("../controllers/authController.js");

router.post("/logout", authController.logoutUser);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:resetToken", authController.resetPassword);

module.exports = router;
