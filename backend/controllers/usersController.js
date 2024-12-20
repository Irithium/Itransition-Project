const { Users } = require("../models");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../constants");
const { formatLastActivity } = require("../utils/dateFormatter");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

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
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

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
      .json({ message: req.t("SUCCESS_MESSAGES.UPDATED"), user: newUser });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.getAllUsers = async (req, res) => {
  const { orderBy, orderDirection } = req.query;
  const orderOptions = {
    email: "email",
    createdAt: "createdAt",
    lastActivity: "updatedAt",
  };
  const direction = orderDirection === "desc" ? "DESC" : "ASC";

  try {
    const orderByColumn = orderOptions[orderBy]
      ? orderOptions[orderBy]
      : "createdAt";

    const users = await Users.findAll({
      order: [[orderByColumn, direction]],
    });

    if (!users) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

    const usersData = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: formatLastActivity(user.createdAt),
      lastActivity: formatLastActivity(user.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json(usersData);
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.SEARCH_FAILED") });
    }

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
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

    const updatedUser = await user.update(req.body);

    return res.json({
      message: req.t("SUCCESS_MESSAGES.USER_UPDATED"),
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.deleteUser = async (req, res) => {
  const { userIds } = req.body;

  try {
    const users = await User.findAll({ where: { id: userIds } });

    if (users.length === 0) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

    for (const user of users) {
      await user.destroy();
    }

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
    const users = await User.findAll({ where: { id: userIds } });

    if (users.length === 0) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

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
          ? { message: req.t("SUCCESS_MESSAGES.ADMIN_ASSIGNED") }
          : { message: req.t("SUCCESS_MESSAGES.ADMIN_REMOVED") }
      );
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.updateBlockStatus = async (req, res) => {
  const { userIds } = req.body;
  const isUnblock = req.params.action === "unblock";

  try {
    const users = await User.findAll({ where: { id: userIds } });

    if (users.length === 0) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

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
  const { query } = req.query;
  try {
    const users = await Users.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    usersData = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    res.status(STATUS_CODES.SUCCESS).json(usersData);
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};
