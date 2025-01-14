const { Comments, CommentLikes, Templates, Users } = require("../models");
const { STATUS_CODES } = require("../constants");
const _ = require("lodash");
const { dateFormatter } = require("../utils/dateFormatter_utils.js");
const { findUserById } = require("../services/findUser.js");
const { handleError } = require("../utils/handleError_utils.js");

exports.createComment = async (req, res) => {
  const { content, templateId } = req.body;

  try {
    const newComment = await Comments.create({
      content,
      templateId,
      authorId: req.user.id,
    });

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.CREATED"),
      comment: newComment,
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

exports.getCommentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await findUserById(userId);

    const comments = await Comments.findAll({
      where: { authorId: userId },
      include: [
        {
          model: CommentLikes,
          attributes: ["id"],
          as: "likes",
        },
      ],
      group: ["Comments.id", "likes.id"],
      order: [["createdAt", "ASC"]],
    });

    const formattedComments = _.map(comments, (comment) => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      templateId: comment.templateId,
      likes: comment.likes.length || 0,
      createdAt: dateFormatter(comment.createdAt),
      updatedAt: dateFormatter(comment.updatedAt),
    }));

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json(formattedComments);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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
          model: Users,
          attributes: ["username"],
          as: "author",
        },
        {
          model: CommentLikes,
          attributes: ["id"],
          as: "likes",
        },
      ],
      group: ["Comments.id", "likes.id"],
      order: [["createdAt", "ASC"]],
    });

    const formattedComments = _.map(comments, (comment) => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      author: comment.author.username,
      likes: comment.likes.length || 0,
      createdAt: dateFormatter(comment.createdAt),
      updatedAt: dateFormatter(comment.updatedAt),
    }));

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json(formattedComments);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
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

    await comment.update({ content });

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.UPDATED"),
      comment,
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

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.COMMENT.DELETED"),
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
