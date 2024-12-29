const { Users, Comments, Templates, Forms } = require("../models");
const { STATUS_CODES } = require("../constants");

const checkPermissions = (model) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const objectId = req.params.id;

    models = [Users, Comments, Templates, Forms];

    try {
      const user = await Users.findByPk(userId);
      const object = await models[model].findByPk(objectId);

      if (!object) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ error: "Object not found." });
      }

      if (object.authorId !== userId && !user.isAdmin) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          error: "Only the author or admins can perform this action.",
        });
      }

      next();
    } catch (error) {
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: req.t("ERROR_MESSAGES.SERVER_ERROR") });
    }
  };
};

module.exports = {
  checkPermissions,
};
