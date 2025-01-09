const { Comments, CommentLikes, Templates } = require("../models");
const { STATUS_CODES } = require("../constants");
const { checkPermissions } = require("../middlewares/permitMiddleware");
const { formatLastActivity } = require("../utils/dateFormatter");
const { findUserById } = require("../utils/findUser.js");

exports.createComment = async (req, res) => {
  const { content, templateId } = req.body;

  try {
    const newComment = await Comments.create({
      content,
      templateId,
      authorId: req.user.id,
    });

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.CREATED"),
      comment: newComment,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getCommentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await findUserById(userId);

    const comments = await Comments.findAll({
      where: { authorId: userId },
      include: [
        {
          model: CommentLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("CommentLikes.id")), "likes"],
          ],
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: formatLastActivity(comment.createdAt),
      updatedAt: formatLastActivity(comment.updatedAt),
      authorId: comment.authorId,
      templateId: comment.templateId,
      likes: comment.dataValues.likes || 0,
    }));

    res.status(STATUS_CODES.SUCCESS).json(formattedComments);
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getCommentsByTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await Templates.findByPk(templateId);

    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const comments = await Comments.findAll({
      where: { templateId },
      include: [
        {
          model: CommentLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("CommentLikes.id")), "likes"],
          ],
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: formatLastActivity(comment.createdAt),
      updatedAt: formatLastActivity(comment.updatedAt),
      authorId: comment.authorId,
      templateId: comment.templateId,
      likes: comment.dataValues.likes || 0,
    }));

    res.status(STATUS_CODES.SUCCESS).json(formattedComments);
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comments.findByPk(id);
    if (!comment) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.COMMENT.NOT_FOUND") });
    }

    await checkPermissions(req.user.id, comment);

    await comment.update({ content });

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.UPDATED"),
      comment,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comments.findByPk(id);
    if (!comment) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.COMMENT.NOT_FOUND") });
    }

    await comment.destroy();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.DELETED"),
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};
