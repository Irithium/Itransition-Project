const {
  TemplateLikes,
  CommentLikes,
  Templates,
  Comments,
  Users,
  Tags,
  Topics,
} = require("../models");
const { STATUS_CODES } = require("../constants");

exports.createLike = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.user.id;

  try {
    if (type === "template") {
      const template = await Templates.findByPk(id);
      if (!template) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
      }

      const like = await TemplateLikes.create({
        userId,
        templateId: id,
      });

      return res.status(STATUS_CODES.CREATED).json({
        message: req.t("SUCCESS_MESSAGES.LIKE.CREATED"),
        like,
      });
    } else if (type === "comment") {
      const comment = await Comments.findByPk(id);
      if (!comment) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ error: req.t("ERROR_MESSAGES.COMMENT.NOT_FOUND") });
      }

      const like = await CommentLikes.create({
        userId,
        commentId: id,
      });

      return res.status(STATUS_CODES.CREATED).json({
        message: req.t("SUCCESS_MESSAGES.LIKE.CREATED"),
        like,
      });
    } else {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.LIKE.INVALID_TYPE") });
    }
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.deleteLike = async (req, res) => {
  const { type, id } = req.params;
  const userId = req.user.id;

  try {
    if (type === "template") {
      const like = await TemplateLikes.findOne({
        where: { userId, templateId: id },
      });

      if (!like) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ error: req.t("ERROR_MESSAGES.LIKE.NOT_FOUND") });
      }

      await like.destroy();

      return res.status(STATUS_CODES.SUCCESS).json({
        message: req.t("SUCCESS_MESSAGES.LIKE.DELETED"),
      });
    } else if (type === "comment") {
      const like = await CommentLikes.findOne({
        where: { userId, commentId: id },
      });

      if (!like) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ error: req.t("ERROR_MESSAGES.LIKE.NOT_FOUND") });
      }

      await like.destroy();

      return res.status(STATUS_CODES.SUCCESS).json({
        message: req.t("SUCCESS_MESSAGES.LIKE.DELETED"),
      });
    } else {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.LIKE.INVALID_TYPE") });
    }
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getTemplatesByLikes = async (req, res) => {
  const userId = req.user.id;

  try {
    const likes = await TemplateLikes.findAll({
      where: { userId },
      include: [
        {
          model: Templates,
          include: [
            { model: Users, attributes: ["username"] },
            {
              model: TemplateLikes,
              attributes: [
                [
                  sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")),
                  "likes",
                ],
              ],
              required: false,
            },
            {
              model: Tags,
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
            { model: Topics, attributes: ["name"] },
          ],
        },
      ],
    });

    const templates = likes.map((like) => ({
      id: like.Templates.id,
      title: like.Templates.title,
      description: like.Templates.description,
      imageUrl: like.Templates?.image_url || null,
      authorId: like.Templates.authorId,
      author: like.Templates.Users.username,
      likes: like.Templates.dataValues.likes || 0,
      responses: like.Templates.dataValues.responses || 0,
      topicId: like.Templates.topicId,
      tagsId: like.Templates.Tags
        ? like.Template.Tags.map((tag) => tag.id)
        : [],
      createdAt: formatLastActivity(like.Template.createdAt),
      updatedAt: formatLastActivity(like.Template.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json(templates);
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};
