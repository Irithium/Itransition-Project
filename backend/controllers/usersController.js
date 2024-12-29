const { Users } = require("../models");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../constants");
const { formatLastActivity } = require("../utils/dateFormatter");
const { findUsersById, findUserById } = require("../utils/findUser");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, req, res);

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: formatLastActivity(user.createdAt),
      lastActivity: formatLastActivity(user.updatedAt),
    };

    res.status(STATUS_CODES.SUCCESS).json(newUser);
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, req, res);

    await user.update(req.body);

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: formatLastActivity(user.createdAt),
      lastActivity: formatLastActivity(user.updatedAt),
    };

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.USER.UPDATED"), user: newUser });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getAllUsers = async (req, res) => {
  const {
    orderBy,
    orderDirection,
    page = 1,
    limit = 10,
    adminFilter = null,
    blockFilter = null,
    usernameInitial = "",
  } = req.query;

  const orderOptions = {
    email: "email",
    createdAt: "createdAt",
    lastActivity: "updatedAt",
  };

  const direction = orderDirection === "desc" ? "DESC" : "ASC";
  const offset = (page - 1) * limit;

  try {
    const whereConditions = {};
    if (adminFilter !== null) whereConditions.isAdmin = adminFilter === "true";
    if (blockFilter !== null)
      whereConditions.isBlocked = blockFilter === "true";
    if (usernameInitial)
      whereConditions.username = { [Op.iLike]: `${usernameInitial}%` }; // Filtrado por inicial del username.

    const users = await Users.findAndCountAll({
      where: whereConditions,
      order: [[orderOptions[orderBy] || "createdAt", direction]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const usersData = users.rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: formatLastActivity(user.createdAt),
      lastActivity: formatLastActivity(user.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      total: users.count,
      page: parseInt(page),
      limit: parseInt(limit),
      users: usersData,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id, req, res);

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: formatLastActivity(user.createdAt),
      lastActivity: formatLastActivity(user.updatedAt),
    };

    res.status(STATUS_CODES.SUCCESS).json(newUser);
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, req, res);

    const updatedUser = await user.update(req.body);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.USER.UPDATED"),
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.deleteUser = async (req, res) => {
  const { userIds } = req.body;

  try {
    await findUsersById(userIds, req, res);

    await Users.destroy({ where: { id: userIds } });

    req.user.lastActivity = new Date();
    await req.user.save();

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.USER_DELETED") });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.updateAdminStatus = async (req, res) => {
  const { userIds } = req.body;
  const isAssign = req.params.action === "assign";

  try {
    const users = await findUsersById(userIds, req, res);

    for (const user of users) {
      user.isAdmin = isAssign;
      await user.save();
    }

    req.user.lastActivity = new Date();
    await req.user.save();

    return res
      .status(STATUS_CODES.SUCCESS)
      .json(
        isAssign
          ? { message: req.t("SUCCESS_MESSAGES.ADMIN.ASSIGNED") }
          : { message: req.t("SUCCESS_MESSAGES.ADMIN.REMOVED") }
      );
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.updateBlockStatus = async (req, res) => {
  const { userIds } = req.body;
  const isUnblock = req.params.action === "unblock";

  try {
    const users = findUsersById(userIds, req, res);

    for (const user of users) {
      user.isBlocked = isUnblock;
      await user.save();
    }

    req.user.lastActivity = new Date();
    await req.user.save();

    return res
      .status(STATUS_CODES.SUCCESS)
      .json(
        isUnblock
          ? { message: req.t("SUCCESS_MESSAGES.USER_BLOCKED") }
          : { message: req.t("SUCCESS_MESSAGES.USER_UNBLOCKED") }
      );
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.searchUsers = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const users = await Users.findAndCountAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const usersData = users.rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      total: users.count,
      page: parseInt(page),
      limit: parseInt(limit),
      users: usersData,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};
