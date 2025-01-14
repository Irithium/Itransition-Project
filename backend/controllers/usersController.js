const { Users } = require("../models");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../constants");
const { dateFormatter } = require("../utils/dateFormatter_utils");
const { findUsersById, findUserById } = require("../services/findUser");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, req, res);

    req.user.updatedAt = new Date();
    await req.user.save();

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      createdAt: dateFormatter(user.createdAt),
      lastActivity: dateFormatter(user.updatedAt),
    };

    res.status(STATUS_CODES.SUCCESS).json(newUser);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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
    };

    req.user.updatedAt = new Date();
    await req.user.save();

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.USER.UPDATED"), user: newUser });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.getAllUsers = async (req, res) => {
  const {
    orderBy,
    orderDirection,
    page = 1,
    limit = 10,
    isAdmin = null,
    isBlocked = null,
    usernameInitial = "",
  } = req.query;
  console.log(req);

  const orderOptions = {
    email: "email",
    createdAt: "createdAt",
    lastActivity: "updatedAt",
  };

  const direction = orderDirection === "desc" ? "DESC" : "ASC";
  const offset = (page - 1) * limit;

  try {
    const whereConditions = {};
    if (isAdmin !== null) whereConditions.isAdmin = isAdmin === "true";
    if (isBlocked !== null) whereConditions.isBlocked = isBlocked === "true";
    if (usernameInitial)
      whereConditions.username = { [Op.iLike]: `${usernameInitial}%` };

    req.user.updatedAt = new Date();
    await req.user.save();

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
      createdAt: dateFormatter(user.createdAt),
      lastActivity: dateFormatter(user.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      total: users.count,
      page: parseInt(page),
      limit: parseInt(limit),
      users: usersData,
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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
      createdAt: dateFormatter(user.createdAt),
      lastActivity: dateFormatter(user.updatedAt),
    };

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json(newUser);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await findUserById(req.user.id, req, res);

    const updatedUser = await user.update(req.body);

    const newUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isBlocked: updatedUser.isBlocked,
    };

    req.user.updatedAt = new Date();
    await req.user.save();

    return res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.USER.UPDATED"),
      user: newUser,
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.deleteUser = async (req, res) => {
  const { userIds } = req.body;

  try {
    await findUsersById(userIds, req, res);

    req.user.updatedAt = new Date();
    await req.user.save();

    await Users.destroy({ where: { id: userIds } });

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.USER_DELETED") });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.SERVER_ERROR")
    );
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
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await Users.findAndCountAll({
      where: {
        [Op.or]: [
          {
            username: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      },
      attributes: ["id", "username", "email"],
    });

    res.status(STATUS_CODES.SUCCESS).json({
      total: users.count,
      users: users.rows,
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};
