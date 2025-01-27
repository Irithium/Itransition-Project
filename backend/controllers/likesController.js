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
const { dateFormatter } = require("../utils/dateFormatter_utils");
const { handleError } = require("../utils/handleError_utils");

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

      req.user.updatedAt = new Date();
      await req.user.save();

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

      req.user.updatedAt = new Date();
      await req.user.save();

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
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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

      req.user.updatedAt = new Date();
      await req.user.save();

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

      req.user.updatedAt = new Date();
      await req.user.save();

      return res.status(STATUS_CODES.SUCCESS).json({
        message: req.t("SUCCESS_MESSAGES.LIKE.DELETED"),
      });
    } else {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.LIKE.INVALID_TYPE") });
    }
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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
            { model: Users, attributes: ["username"], as: "author" },
            {
              model: TemplateLikes,
              attributes: ["id"],
              required: false,
            },
            {
              model: Tags,
              attributes: ["id", "title"],
              through: { attributes: [] },
            },
            { model: Topics, attributes: ["title"] },
          ],
        },
      ],
    });

    const templates = _.map(likes, (like) => ({
      id: like.Templates.id,
      title: like.Templates.title,
      description: like.Templates.description,
      imageUrl: like.Templates?.image_url || null,
      authorId: like.Templates.authorId,
      author: like.Templates.author.username,
      likes: like.Templates.likes.length || 0,
      responses: like.Templates.responses.length || 0,
      topicId: like.Templates.topicId,
      tagsId: like.Templates.Tags
        ? like.Template.Tags.map((tag) => tag.id)
        : [],
      createdAt: dateFormatter(like.Template.createdAt),
      updatedAt: dateFormatter(like.Template.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json(templates);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};
