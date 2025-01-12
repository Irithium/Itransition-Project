const { STATUS_CODES } = require("../constants");

exports.handleError = (res, code, error, message) => {
  console.log(error);
  return res.status(code).json({ error: message });
};
