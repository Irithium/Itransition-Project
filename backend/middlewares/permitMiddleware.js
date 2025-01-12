const { Users, Comments, Templates, Forms } = require("../models");
const { STATUS_CODES } = require("../constants");

const checkPermissions = (model) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    const objectId = req.params?.id;

    const models = { Users, Comments, Templates, Forms };

    try {
      const user = await Users.findByPk(userId);
      console.log(model);
      const object = await model.findByPk(objectId);

      if (!object) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          error: req.t("ERROR_MESSAGES.GENERAL.OBJECT_NOT_FOUND"),
        });
      }

      if (object.authorId !== userId && !user.isAdmin) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          error: req.t("ERROR_MESSAGES.GENERAL.PERMISSIONS_REQUIRED"),
        });
      }

      next();
    } catch (error) {
      console.log(error);
      return res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
    }
  };
};

module.exports = {
  checkPermissions,
};
