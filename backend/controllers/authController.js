const { Users } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../constants");
const { handleError } = require("../utils/handleError_utils");
const { sendEmail } = require("../utils/email_utils");
const i18next = require("../utils/translate_utils.js");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        error: req.t("ERROR_MESSAGES.AUTH.USER_ALREADY_EXISTS"),
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
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.AUTH.USER_NOT_FOUND") });
    }

    if (user.isBlocked) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ error: req.t("ERROR_MESSAGES.AUTH.ACCOUNT_BLOCKED") });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: req.t("ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS") });
    }

    await Users.update({ updatedAt: new Date() }, { where: { id: user.id } });

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
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.logoutUser = async (req, res) => {
  try {
    req.user.updatedAt = new Date();
    await req.user.save();

    return res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.LOGOUT"),
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.AUTH.USER_NOT_FOUND") });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    const message = `
    <html>
      <head>
        <style>
         body {
           font-family: Arial, sans-serif;
            background-color: #f6f6f6;
            margin: 0;
            padding: 20px;
          }
         .container {
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
         }
          h1 {
          color: #333;
          }
          p {
          color: #000;
          line-height: 1.5;
          align-text: center;
          }
          .button {
           display: inline-block;
           padding: 10px 15px;
           margin: 20px 0;
           background-color: #007bff;
           color: white;
           text-decoration: none;
           border-radius: 5px;
          }
         .footer {
           font-size: 12px;
           color: #999;
           margin-top: 20px;
         }
        </style>
      </head>
     <body>
       <div class="container">
        <h1>${i18next.t("EMAIL.RESET_PASSWORD.SUBJECT", {
          lng: req.language,
        })}</h1>
         <p>${i18next.t("EMAIL.RESET_PASSWORD.MESSAGE", {
           lng: req.language,
         })}</p>
         <a class="button" href="${resetUrl}">
         ${i18next.t("EMAIL.RESET_PASSWORD.BUTTON", { lng: req.language })}
         </a>
          <p>${i18next.t("EMAIL.RESET_PASSWORD.IGNORE", {
            lng: req.language,
          })}</p>
       </div>
       <div class="footer">
          <p>${i18next.t("EMAIL.RESET_PASSWORD.DONT_REPLY", {
            lng: req.language,
          })}</p>
       </div>
      </body>
   </html>
  `;

    await sendEmail({
      email: user.email,
      subject: i18next.t("EMAIL.RESET_PASSWORD.SUBJECT", { lng: req.language }),
      message,
    });

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.AUTH.RESET_EMAIL_SENT"),
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

exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await Users.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.AUTH.INVALID_TOKEN") });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
    });

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.AUTH.PASSWORD_RESET"),
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
