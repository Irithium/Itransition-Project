const { jwt } = require("jsonwebtoken");
const { STATUS_CODES } = require("../constants");
const { Users } = require("../models");

const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: req.t("ERROR_MESSAGES.AUTH.ACCESS_DENIED") });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Users.findByPk(decoded.id);

    if (!req.user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: req.t("ERROR_MESSAGES.USER.NOT_FOUND") });
    }

    if (req.user.isBlocked) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: req.t("ERROR_MESSAGES.AUTH.ACCOUNT_BLOCKED") });
    }

    next();
  } catch (err) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: req.t("ERROR_MESSAGES.AUTH.INVALID_TOKEN") });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: req.t("ERROR_MESSAGES.ADMIN.ACCESS_REQUIRED") });
  }
  next();
};

module.exports = { authenticateJWT, isAdmin };
