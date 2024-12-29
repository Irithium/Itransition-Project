const {
  Templates,
  Questions,
  Tags,
  TemplateTags,
  TemplateLikes,
  Users,
  Topics,
  Comments,
} = require("../models");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../constants");
const { formatLastActivity } = require("../utils/dateFormatter");

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

    if (questions.length > 16 || questions.length < 1) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.QUESTIONS_LIMIT") });
    }

    const limitTypes = {
      "single-line": 4,
      "multiple-line": 4,
      integer: 4,
      checkbox: 4,
    };
    const questionTypeCounts = {
      "single-line": 0,
      "multiple-line": 0,
      integer: 0,
      checkbox: 0,
    };

    for (const question of questions) {
      if (!limitTypes[question.questionType]) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          error: req.t("ERROR_MESSAGES.TEMPLATE.INVALID_QUESTION_TYPE"),
        });
      }
      questionTypeCounts[question.questionType]++;
      if (
        questionTypeCounts[question.questionType] >
        limitTypes[question.questionType]
      ) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          error: req.t("ERROR_MESSAGES.TEMPLATE.QUESTIONS_TYPE_LIMIT", {
            questionType: question.questionType,
          }),
        });
      }
    }

    const newTemplate = await Templates.create({
      title,
      description,
      topicId,
      imageUrl,
      authorId: req.user.id,
      accessSettings,
    });

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await Questions.create({
        ...question,
        order: i + 1,
        templateId: newTemplate.id,
      });
    }

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        let [tagInstance] = await Tags.findOrCreate({
          where: { name: tag },
        });
        await TemplateTags.create({
          templateId: newTemplate.id,
          tagId: tagInstance.id,
        });
      }
    }

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.TEMPLATE.CREATED"),
      templateId: newTemplate.id,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.CREATION_ERROR") });
  }
};

exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { title, description, topicId, imageUrl, questions } = req.body;

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
      imageUrl,
    });

    if (questions.length > 16 || questions.length < 1) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.QUESTIONS_LIMIT") });
    }

    const limitTypes = {
      "single-line": 4,
      "multiple-line": 4,
      integer: 4,
      checkbox: 4,
    };

    const currentQuestions = await Questions.findAll({
      where: { templateId: id },
    });

    const questionsToKeep = [];
    for (const question of currentQuestions) {
      const newQuestion = questions.find((q) => q.id === question.id);
      if (!newQuestion) {
        await question.destroy();
      } else {
        questionsToKeep.push(newQuestion);
      }
    }

    for (const question of questions) {
      if (!questionsToKeep.some((q) => q.id === question.id)) {
        if (
          questionsToKeep.filter(
            (q) => q.questionType === question.questionType
          ).length < limitTypes[question.questionType]
        ) {
          await Questions.create({
            title: question.title,
            description: question.description,
            questionType: question.questionType,
            isVisible: question.isVisible,
            templateId: id,
          });
        } else {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            error: req.t("ERROR_MESSAGES.TEMPLATE.QUESTIONS_TYPE_LIMIT", {
              questionType: question.questionType,
            }),
          });
        }
      }
    }

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.TEMPLATE.UPDATED") });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.UPDATE_ERROR") });
  }
};

exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

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
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.DELETING_ERROR") });
  }
};

exports.getAllTemplates = async (req, res) => {
  const { orderBy = "title", order = "asc", page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const templates = await Templates.findAll({
      include: [
        { model: Users, attributes: ["username"] },
        {
          model: TemplateLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")), "likes"],
          ],
          required: false,
        },
        {
          model: Forms,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("Forms.id")), "responses"],
          ],
          required: false,
        },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
      group: ["Templates.id", "Users.id", "Tags.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit,
      offset,
    });

    const totalTemplates = await Templates.count();
    res.status(STATUS_CODES.SUCCESS).json({
      total: totalTemplates,
      page: Number(page),
      limit: Number(limit),
      templates: templates.map((template) => ({
        id: template.id,
        title: template.title,
        description: template.description,
        imageUrl: template?.image_url || null,
        authorId: template.authorId,
        author: template.Users.username,
        likes: template.dataValues.likes || 0,
        responses: template.dataValues.responses || 0,
        topicId: template.topicId,
        tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
        createdAt: formatLastActivity(template.createdAt),
        updatedAt: formatLastActivity(template.updatedAt),
      })),
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getTemplateById = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await Templates.findByPk(id, {
      include: [
        { model: Users, attributes: ["username"] },
        {
          model: TemplateLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")), "likes"],
          ],
          required: false,
        },
        {
          model: Comments,
          attributes: ["id", "content", "createdAt", "updatedAt", "userId"],
          include: [{ model: Users, attributes: ["username"] }],
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
          required: false,
        },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const formattedQuestions = template.Questions.map((question) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      questionType: question.questionType,
      isVisible: question.isVisible,
      order: question.order,
    }));

    const comments = template.Comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: formatLastActivity(comment.createdAt),
      updatedAt: formatLastActivity(comment.updatedAt),
      userId: comment.userId,
      username: comment.User.username,
      likes: comment.dataValues.likes || 0,
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      id: template.id,
      title: template.title,
      description: template.description,
      imageUrl: template?.image_url || null,
      authorId: template.authorId,
      author: template.Users.username,
      likes: template.dataValues.likes || 0,
      responses: template.dataValues.responses || 0,
      topicId: template.topicId,
      tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
      questions: formattedQuestions,
      comments,
      createdAt: formatLastActivity(template.createdAt),
      updatedAt: formatLastActivity(template.updatedAt),
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getFilteredTemplates = async (req, res) => {
  const {
    topicId,
    tags,
    orderBy = "title",
    order = "asc",
    page = 1,
    limit = 10,
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = {
      include: [
        { model: Users, attributes: ["username"] },
        { model: Topics, where: { id: topicId }, required: false },
        {
          model: Tags,
          attributes: ["id"],
          where: tags ? { id: tags.split(",") } : null,
          through: { attributes: [] },
          required: false,
        },
        {
          model: TemplateLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")), "likes"],
          ],
          required: false,
        },
        {
          model: Forms,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("Forms.id")), "responses"],
          ],
          required: false,
        },
      ],
      group: ["Templates.id", "Users.id", "Tags.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit,
      offset,
    };

    const templates = await Templates.findAll(query);

    const totalTemplates = await Templates.count({
      where: {
        ...(topicId && { topicId }),
        ...(tags && { id: tags.split(",") }),
      },
    });

    res.status(STATUS_CODES.SUCCESS).json({
      total: totalTemplates,
      page: Number(page),
      limit: Number(limit),
      templates: templates.map((template) => ({
        id: template.id,
        title: template.title,
        description: template.description,
        imageUrl: template?.image_url || null,
        authorId: template.authorId,
        author: template.Users.username,
        likes: template.dataValues.likes || 0,
        responses: template.dataValues.responses || 0,
        topicId: template.topicId,
        tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
        createdAt: formatLastActivity(template.createdAt),
        updatedAt: formatLastActivity(template.updatedAt),
      })),
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.FILTERING_ERROR") });
  }
};

exports.getUserTemplates = async (req, res) => {
  const { authorId } = req.params;
  const { orderBy = "title", order = "asc", page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = {
      where: { authorId },
      include: [
        { model: Users, attributes: ["username"] },
        {
          model: Tags,
          attributes: ["id"],
          where: tags ? { id: tags.split(",") } : null,
          through: { attributes: [] },
          required: false,
        },
        {
          model: TemplateLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")), "likes"],
          ],
          required: false,
        },
        {
          model: Forms,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("Forms.id")), "responses"],
          ],
          required: false,
        },
      ],
      group: ["Templates.id", "Users.id", "Tags.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit,
      offset,
    };

    const templates = await Templates.findAll(query);

    const totalTemplates = await Templates.count({
      where: { authorId },
    });

    res.status(STATUS_CODES.SUCCESS).json({
      total: totalTemplates,
      page: Number(page),
      limit: Number(limit),
      templates: templates.map((template) => ({
        id: template.id,
        title: template.title,
        description: template.description,
        imageUrl: template?.image_url || null,
        authorId: template.authorId,
        likes: template.dataValues.likes || 0,
        responses: template.dataValues.responses || 0,
        topicId: template.topicId,
        tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
        createdAt: formatLastActivity(template.createdAt),
        updatedAt: formatLastActivity(template.updatedAt),
      })),
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
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
    const searchQuery = await Templates.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Users, attributes: ["username"] },
        {
          model: Tags,
          attributes: ["id"],
          where: tags ? { id: tags.split(",") } : null,
          through: { attributes: [] },
          required: false,
        },
        {
          model: TemplateLikes,
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("TemplateLikes.id")), "likes"],
          ],
          required: false,
        },
      ],
      group: ["Templates.id", "Users.id", "Tags.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const templates = await Templates.findAll(searchQuery);
    const totalTemplates = await Templates.count({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    res.status(STATUS_CODES.SUCCESS).json({
      total: totalTemplates,
      page: Number(page),
      limit: Number(limit),
      templates: templates.map((template) => ({
        id: template.id,
        title: template.title,
        description: template.description,
        imageUrl: template?.image_url || null,
        authorId: template.authorId,
        author: template.Users.username,
        likes: template.dataValues.likes || 0,
        responses: template.dataValues.responses || 0,
        topicId: template.topicId,
        tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
        createdAt: formatLastActivity(template.createdAt),
        updatedAt: formatLastActivity(template.updatedAt),
      })),
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SEARCH_FAILED") });
  }
};

exports.updateAccessSettings = async (req, res) => {
  const { id } = req.params;
  const { accessSettings } = req.body;
  const userId = req.user.id;

  try {
    const template = await Templates.findByPk(id);
    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    await checkPermissions(userId, template);

    await template.update({ accessSettings });

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: req.t("SUCCESS_MESSAGES.ACCESS_SETTINGS.UPDATED") });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.ACCESS_SETTINGS.UPDATE_ERROR") });
  }
};
