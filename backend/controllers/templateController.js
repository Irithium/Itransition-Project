const {
  Templates,
  Questions,
  Options,
  Tags,
  Forms,
  TemplateTags,
  TemplateLikes,
  Users,
  Topics,
  Comments,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../constants");
const { dateFormatter } = require("../utils/dateFormatter_utils");
const _ = require("lodash");
const {
  formatTemplate,
  formatTemplateDates,
} = require("../utils/formatTemplate_utils");
const { handleError } = require("../utils/handleError_utils");
const {
  createOrUpdateQuestions,
} = require("../services/createOrUpdateQuestions");

exports.createTemplate = async (req, res) => {
  const {
    title,
    description,
    topicId,
    questions,
    imageUrl,
    tags,
    accessSettings,
  } = req.body;

  try {
    const topicExists = await Topics.findByPk(topicId);
    if (!topicExists) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TOPIC.NOT_FOUND") });
    }

    const newTemplate = await Templates.create({
      title,
      description,
      topicId,
      image_url: imageUrl || null,
      authorId: req.user.id,
      accessSettings,
    });

    await createOrUpdateQuestions(questions, newTemplate.id, req);

    if (tags && !_.isEmpty(tags)) {
      for (const tag of tags) {
        let [tagInstance] = await Tags.findOrCreate({
          where: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("title")),
            sequelize.fn("LOWER", tag)
          ),
        });
        await TemplateTags.create({
          templateId: newTemplate.id,
          tagId: tagInstance.id,
        });
      }
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: req.t("ERROR_MESSAGES.TAGS.NOT_FOUND"),
        templateId: newTemplate.id,
      });
    }

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.TEMPLATE.CREATED"),
      templateId: newTemplate.id,
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.TEMPLATE.CREATION_ERROR")
    );
  }
};

exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { title, description, topicId, imageUrl, questions, tags } = req.body;

  try {
    const template = await Templates.findByPk(id);
    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    await template.update({
      title,
      description,
      topicId,
      image_url: imageUrl,
    });

    if (questions) {
      await createOrUpdateQuestions(questions, id, req);
    }

    if (tags && !_.isEmpty(tags)) {
      await TemplateTags.destroy({ where: { templateId: id } });
      for (const tag of tags) {
        let [tagInstance] = await Tags.findOrCreate({
          where: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("title")),
            sequelize.fn("LOWER", tag)
          ),
        });
        await TemplateTags.create({
          templateId: id,
          tagId: tagInstance.id,
        });
      }
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.TEMPLATE.UPDATED"),
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.TEMPLATE.UPDATE_ERROR")
    );
  }
};

exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await Templates.findByPk(id);
    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    await template.destroy();

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.TEMPLATE.DELETED") });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.TEMPLATE.DELETING_ERROR")
    );
  }
};

exports.getTemplates = async (req, res) => {
  const {
    orderBy = "title",
    order = "asc",
    page = 1,
    limit = 10,
    topic,
    tags,
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const where = {};
    if (topic) where.topicId = topic;
    if (tags) {
      const tagArray = tags.replace(/[\[\]\s]/g, "").split(",");
      where["$Tags.id$"] = { [Op.in]: tagArray };
    }
    console.log("Soy where: ", where);

    const { count, rows } = await Templates.findAndCountAll({
      where,
      include: [
        {
          model: TemplateLikes,
          attributes: ["id"],
          as: "likes",
        },
        {
          model: Forms,
          attributes: ["id"],
        },
        {
          model: Users,
          attributes: ["username"],
          as: "author",
        },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: !!tags,
        },
      ],
      group: ["Templates.id", "likes.id", "Forms.id", "author.id", "Tags.id"],
      limit: limit,
      offset: offset,
      subQuery: false,
    });

    const formattedTemplates = _.map(rows, formatTemplate);
    const sortedTemplates = _.orderBy(formattedTemplates, [orderBy], [order]);
    const finalTemplates = _.map(sortedTemplates, formatTemplateDates);

    res.status(STATUS_CODES.SUCCESS).json({
      total: count.length,
      pages: Math.ceil(count.length / limit),
      page: Number(page),
      limit: Number(limit),
      templates: finalTemplates,
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

exports.getTemplateById = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await Templates.findByPk(id, {
      include: [
        {
          model: Users,
          attributes: ["username"],
          as: "author",
        },
        {
          model: TemplateLikes,
          attributes: ["id"],
          as: "likes",
        },
        {
          model: Comments,
          attributes: ["id", "content", "createdAt", "updatedAt", "authorId"],
          include: [{ model: Users, attributes: ["username"], as: "author" }],
          required: false,
          order: [["createdAt", "ASC"]],
        },
        {
          model: Questions,
          attributes: [
            "id",
            "title",
            "description",
            "questionType",
            "isVisible",
            "order",
          ],
          include: [
            {
              model: Options,
              as: "options",
              attributes: ["id", "title", "value"],
            },
          ],
          required: false,
          order: [["order", "ASC"]],
        },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
      group: [
        "Templates.id",
        "author.id",
        "Comments.id",
        "Comments->author.id",
        "Questions.id",
        "Questions->options.id",
        "Tags.id",
        "likes.id",
      ],
    });

    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const formattedQuestions = _.map(template.Questions, (question) => {
      if (question.questionType === "checkbox") {
        return {
          id: question.id,
          title: question.title,
          description: question.description,
          questionType: question.questionType,
          isVisible: question.isVisible,
          order: question.order,
          options: question.options.map((option) => ({
            id: option.id,
            title: option.title,
            value: option.value,
          })),
        };
      }

      return {
        id: question.id,
        title: question.title,
        description: question.description,
        questionType: question.questionType,
        isVisible: question.isVisible,
        order: question.order,
      };
    });

    const sortedQuestions = _.orderBy(formattedQuestions, "order", "asc");

    const formattedComments = _.map(template.Comments, (comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: dateFormatter(comment.createdAt),
      updatedAt: dateFormatter(comment.updatedAt),
      authorId: comment.authorId,
      username: comment.author.username,
      likes: comment.dataValues.likes || 0,
    }));

    const formattedTemplate = {
      id: template.id,
      title: template.title,
      description: template.description,
      imageUrl: template?.image_url || null,
      author: template.author.username,
      authorId: template.authorId,
      accessSettings: template.accessSettings,
      topicId: template.topicId,
      tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
      questions: sortedQuestions,
      comments: formattedComments,
      likes: template.likes.length || 0,
      createdAt: dateFormatter(template.createdAt),
      updatedAt: dateFormatter(template.updatedAt),
    };

    res.status(STATUS_CODES.SUCCESS).json({ template: formattedTemplate });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR")
    );
  }
};

exports.getUserTemplates = async (req, res) => {
  const { authorId } = req.params;
  const { orderBy = "title", order = "asc", page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Templates.findAndCountAll({
      where: { authorId },
      include: [
        { model: Users, attributes: ["username"], as: "author" },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: TemplateLikes,
          attributes: ["id"],
          as: "likes",
          required: false,
        },
        {
          model: Forms,
          attributes: ["id"],
          required: false,
        },
      ],
      group: ["Templates.id"],
      limit: limit,
      offset: offset,
    });

    const formattedTemplates = rows.map(formatTemplate);
    const sortedTemplates = _.orderBy(formattedTemplates, [orderBy], [order]);
    const finalTemplates = sortedTemplates.map(formatTemplateDates);

    res.status(STATUS_CODES.SUCCESS).json({
      total: count.length,
      page: Number(page),
      limit: Number(limit),
      templates: finalTemplates,
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

exports.searchTemplates = async (req, res) => {
  const {
    query,
    page = 1,
    limit = 10,
    orderBy = "createdAt",
    order = "asc",
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    if (!query) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        error: req.t("ERROR_MESSAGES.GENERAL.INVALID_QUERY"),
      });
    }
    const search = decodeURIComponent(query).toLowerCase();
    console.log(search);
    const { count, rows } = await Templates.findAndCountAll({
      where: {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Templates.title")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Templates.description")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Questions.title")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Questions.description")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Comments.content")),
            { [Op.like]: `%${search}%` }
          ),
        ],
      },
      include: [
        { model: Users, attributes: ["username"], as: "author" },
        {
          model: Questions,

          required: false,
          include: [
            {
              model: Options,
              as: "options",
              attributes: ["id", "title", "value"],
            },
          ],
        },
        {
          model: Comments,

          required: false,
          include: [{ model: Users, attributes: ["username"], as: "author" }],
        },
        {
          model: TemplateLikes,
          attributes: ["id"],
          as: "likes",
        },
        {
          model: Tags,
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
      ],
      group: [
        "Templates.id",
        "author.id",
        "Comments.id",
        "Comments->author.id",
        "Questions.id",
        "Questions->options.id",
        "Tags.id",
        "likes.id",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const formattedTemplates = _.map(rows, formatTemplate);
    const sortedTemplates = _.orderBy(formattedTemplates, [orderBy], [order]);
    const finalTemplates = _.map(sortedTemplates, formatTemplateDates);

    res.status(STATUS_CODES.SUCCESS).json({
      page: Number(page),
      limit: Number(limit),
      templates: finalTemplates,
    });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.GENERAL.SEARCH_FAILED")
    );
  }
};

exports.updateAccessSettings = async (req, res) => {
  const { id } = req.params;
  const { accessSettings } = req.body;

  try {
    const template = await Templates.findByPk(id);
    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    await template.update({ accessSettings });

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.ACCESS_SETTINGS.UPDATED") });
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.ACCESS_SETTINGS.UPDATE_ERROR")
    );
  }
};
