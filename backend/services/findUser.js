const { Users } = require("../models");

const findUserById = async (userId, req, res) => {
  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER.NOT_FOUND") });
    }
    return user;
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

const findUsersById = async (userIds, req, res) => {
  try {
    const users = await Users.findAll({ where: { id: userIds } });
    if (users.length === 0) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER.NOT_FOUND") });
    }
    return users;
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
    return null;
  }
};

module.exports = { findUserById, findUsersById };
