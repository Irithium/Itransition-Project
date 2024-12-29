const { Forms, Templates, Users, Questions } = require("../models");
const { STATUS_CODES } = require("../constants");
const { formatLastActivity } = require("../utils/dateFormatter");
const { findUserById } = require("../utils/findUser.js");

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

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.FORM.SUBMITTED"),
      form: newForm,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getFormsByTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await findByPk(templateId);

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
          attributes: ["title", "description", "questionType"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const formattedForms = forms.map((form) => ({
      id: form.id,
      content: form.content,
      authorId: form.authorId,
      username: form.User.username,
      templateId: form.templateId,
      questionId: form.questionId,
      createdAt: formatLastActivity(form.createdAt),
      updatedAt: formatLastActivity(form.updatedAt),
      question: {
        title: form.Question.title,
        description: form.Question.description,
        questionType: form.Question.questionType,
      },
    }));

    res.status(STATUS_CODES.SUCCESS).json(formattedForms);
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
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
          attributes: ["title", "description", "questionType"],
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
      createdAt: formatLastActivity(form.createdAt),
      updatedAt: formatLastActivity(form.updatedAt),
      template: {
        title: form.Template.title,
        description: form.Template.description,
      },
      question: {
        title: form.Question.title,
        description: form.Question.description,
        questionType: form.Question.questionType,
      },
    }));

    res.status(STATUS_CODES.SUCCESS).json(formattedForms);
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
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

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.FORM.UPDATED"),
      form,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
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

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.FORM.DELETED"),
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};
