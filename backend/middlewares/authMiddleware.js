const { jwt } = require("jsonwebtoken");
const { STATUS_CODES } = require("../constants");

const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (req.user.isBlocked) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: req.t("ERROR_MESSAGES.ACCOUNT_BLOCKED") });
  }

  if (!token) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: req.t("ERROR_MESSAGES.ACCESS_DENIED") });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

    next();
  } catch (err) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: req.t("ERROR_MESSAGES.INVALID_TOKEN") });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: req.t("ADMIN_ACCESS_REQUIRED") });
  }
  next();
};

module.exports = { authenticateJWT, isAdmin };
