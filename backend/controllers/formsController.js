const { Forms, Templates, Users, Questions } = require("../models");
const { STATUS_CODES } = require("../constants");
const { dateFormatter } = require("../utils/dateFormatter_utils.js");
const { findUserById } = require("../services/findUser.js");
const { handleError } = require("../utils/handleError_utils.js");

exports.createForm = async (req, res) => {
  const { content, templateId, questionId } = req.body;
  const userId = req.user.id;

  try {
    const template = await Templates.findByPk(templateId);
    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const question = await Questions.findByPk(questionId);
    if (!question) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.QUESTION.NOT_FOUND") });
    }

    const newForm = await Forms.create({
      content,
      userId,
      templateId,
      questionId,
    });

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.FORM.SUBMITTED"),
      form: newForm,
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

exports.getFormsByTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await Templates.findByPk(templateId);

    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const forms = await Forms.findAll({
      where: { templateId },
      include: [
        { model: Users, attributes: ["username"] },
        {
          model: Questions,
          attributes: ["title", "description", "questionType", "isDeleted"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const formattedForms = forms.map((form) => ({
      id: form.id,
      content: form.content,
      authorId: form.authorId,
      username: form.Users.username,
      templateId: form.templateId,
      questionId: form.questionId,
      createdAt: dateFormatter(form.createdAt),
      updatedAt: dateFormatter(form.updatedAt),
      question: {
        title: form.Questions.title,
        description: form.Questions.description,
        questionType: form.Questions.questionType,
        isDeleted: form.Questions.isDeleted,
      },
    }));

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json(formattedForms);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.getFormsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await findUserById(userId);

    const forms = await Forms.findAll({
      where: { userId },
      include: [
        { model: Templates, attributes: ["title", "description"] },
        {
          model: Questions,
          attributes: ["title", "description", "questionType", "isDeleted"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const formattedForms = forms.map((form) => ({
      id: form.id,
      content: form.content,
      authorId: form.authorId,
      templateId: form.templateId,
      questionId: form.questionId,
      template: {
        title: form.Templates.title,
        description: form.Templates.description,
      },
      question: {
        title: form.Questions.title,
        description: form.Questions.description,
        questionType: form.Questions.questionType,
        isDeleted: form.Questions.isDeleted,
      },
      createdAt: dateFormatter(form.createdAt),
      updatedAt: dateFormatter(form.updatedAt),
    }));

    res.status(STATUS_CODES.SUCCESS).json(formattedForms);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const form = await Forms.findByPk(id);
    if (!form) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.FORM.NOT_FOUND") });
    }

    await form.update({ content });

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.FORM.UPDATED"),
      form,
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

exports.deleteForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Forms.findByPk(id);
    if (!form) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.FORM.NOT_FOUND") });
    }

    await form.destroy();

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.FORM.DELETED"),
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
