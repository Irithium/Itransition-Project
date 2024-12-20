const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../constants");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  try {
    const existingUser = await Users.findOne({ where: { email } });
    console.log(existingUser);

    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        error: req.t("ERROR_MESSAGES.USER_ALREADY_EXISTS"),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
    });

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.REGISTERED"),
      token,
      user: newUser,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: req.t("ERROR_MESSAGES.USER_NOT_FOUND") });
    }

    if (user.isBlocked) {
      if (req.user.isBlocked) {
        return res
          .status(STATUS_CODES.FORBIDDEN)
          .json({ message: req.t("ERROR_MESSAGES.ACCOUNT_BLOCKED") });
      }
    }

    if (await bcrypt.compare(password, user.password)) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: req.t("ERROR_MESSAGES.INVALID_CREDENTIALS") });
    }

    await User.update({ lastActivity: new Date() }, { where: { id: user.id } });

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.LOGIN"),
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: req.t("ERROR_MESSAGES.SERVER_ERROR") });
  }
};
