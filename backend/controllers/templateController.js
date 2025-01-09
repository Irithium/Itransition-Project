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
const { Op, Sequelize } = require("sequelize");
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

    const newTemplate = await Templates.create({
      title,
      description,
      topicId,
      image_url: imageUrl || null,
      authorId: req.user.id,
      accessSettings,
    });

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const newQuestion = await Questions.create({
        ...question,
        order: i + 1,
        templateId: newTemplate.id,
      });

      console.log(newQuestion);

      if (
        question.questionType === "checkbox" &&
        question.options.length === 0
      ) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          error: req.t("ERROR_MESSAGES.OPTION.NOT_FOUND"),
        });
      }
      if (question.questionType === "checkbox" && question.options.length > 0) {
        for (const option of question.options) {
          await Options.create({
            title: option.title,
            value: option.value,
            questionId: newQuestion.id,
          });
        }
      }
    }

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        let [tagInstance] = await Tags.findOrCreate({
          where: { title: tag },
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
    console.log(error);
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
      image_url: imageUrl,
    });

    const currentQuestions = await Questions.findAll({
      where: { templateId: id },
    });

    const questionsToKeep = [];
    for (const question of currentQuestions) {
      const updatedQuestion = questions.find((q) => q.id === question.id);
      if (updatedQuestion) {
        if (question.isDeleted) {
          await question.update({ isDeleted: false });
        }
        await question.update(updatedQuestion);
        questionsToKeep.push(question.id);

        if (
          updatedQuestion.questionType === "checkbox" &&
          updatedQuestion.options.length === 0
        ) {
          return res.status(STATUS_CODES.NOT_FOUND).json({
            error: req.t("ERROR_MESSAGES.OPTION.NOT_FOUND"),
          });
        }

        if (
          updatedQuestion.questionType === "checkbox" &&
          updatedQuestion.options.length > 0
        ) {
          await Options.destroy({ where: { questionId: question.id } });
          for (const option of updatedQuestion.options) {
            await Options.create({
              title: option.title,
              value: option.value,
              questionId: question.id,
            });
          }
        }
      } else {
        await question.update({ isDeleted: true });
      }
    }

    for (const question of questions) {
      if (!questionsToKeep.some((q) => q === question.id)) {
        const newQuestion = await Questions.create({
          title: question.title,
          description: question.description,
          questionType: question.questionType,
          isVisible: question.isVisible,
          templateId: id,
        });

        if (
          question.questionType === "checkbox" &&
          question.options.length === 0
        ) {
          return res.status(STATUS_CODES.NOT_FOUND).json({
            error: req.t("ERROR_MESSAGES.OPTION.NOT_FOUND"),
          });
        }

        if (
          question.questionType === "checkbox" &&
          question.options.length > 0
        ) {
          for (const option of question.options) {
            await Options.create({
              title: option.title,
              value: option.value,
              questionId: newQuestion.id,
            });
          }
        }
      }
    }

    const updatedQuestions = await Questions.findAll({
      where: {
        templateId: id,
        isDeleted: false,
      },
      order: [["order", "ASC"]],
    });

    for (let i = 0; i < updatedQuestions.length; i++) {
      await updatedQuestions[i].update({ order: i + 1 });
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

exports.getTemplates = async (req, res) => {
  const { orderBy = "title", order = "asc", page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const templates = await Templates.findAll({
      include: [
        {
          model: Users,
          as: "author",
          attributes: ["id", "username"],
        },
        {
          model: Tags,
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
      group: ["Templates.id", "author.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit: limit,
      offset: offset,
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
        topicId: template.topicId,
        tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
        createdAt: formatLastActivity(template.createdAt),
        updatedAt: formatLastActivity(template.updatedAt),
      })),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.GENERAL.SERVER_ERROR") });
  }
};

exports.getTemplateById = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const template = await Templates.findByPk(id, {
      include: [
        {
          model: Users,
          as: "author",
          attributes: ["username"],
        },
        {
          model: Comments,
          attributes: ["id", "content", "createdAt", "updatedAt", "authorId"],
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
          include: [
            {
              model: Options,
              as: "options",
              attributes: ["id", "title", "value"],
            },
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
      group: [
        "Templates.id",
        "author.id",
        "Comments.id",
        "Comments->User.id",
        "Questions.id",
        "Questions->options.id",
        "Tags.id",
      ],
    });

    if (!template) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TEMPLATE.NOT_FOUND") });
    }

    const formattedQuestions = template.Questions.map((question) => {
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

    const comments = template.Comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: formatLastActivity(comment.createdAt),
      updatedAt: formatLastActivity(comment.updatedAt),
      authorId: comment.authorId,
      username: comment.User.username,
      likes: comment.dataValues.likes || 0,
    }));

    const likeCount = await TemplateLikes.count({
      where: { templateId: id },
    });
    const commentCount = await Comments.count({
      where: { templateId: id },
    });

    res.status(STATUS_CODES.SUCCESS).json({
      id: template.id,
      title: template.title,
      description: template.description,
      imageUrl: template?.image_url || null,
      author: template.author.username,
      authorId: template.authorId,
      accessSettings: template.accessSettings,
      likes: likeCount || 0,
      responses: commentCount || 0,
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
    const templates = await Templates.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: Questions,
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: `%${query}%` } },
              { description: { [Op.iLike]: `%${query}%` } },
            ],
            isDeleted: false,
          },
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
          where: { content: { [Op.iLike]: `%${query}%` } },
          required: false,
          include: [{ model: Users, attributes: ["username"] }],
        },
        {
          model: Tags,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      group: ["Templates.id", "Tags.id"],
      order: [[orderBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const filteredTemplates = templates.filter((template) => {
      const hasMatchingQuestion = template.Questions.some(
        (question) =>
          question.title.toLowerCase().includes(query.toLowerCase()) ||
          question.description.toLowerCase().includes(query.toLowerCase())
      );

      const hasMatchingComment = template.Comments.some((comment) =>
        comment.content.toLowerCase().includes(query.toLowerCase())
      );

      return (
        template.title.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        hasMatchingQuestion ||
        hasMatchingComment
      );
    });

    const totalTemplates = await Templates.count({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: Questions,
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: `%${query}%` } },
              { description: { [Op.iLike]: `%${query}%` } },
            ],
            isDeleted: false,
          },
        },
        {
          model: Comments,
          where: { content: { [Op.iLike]: `%${query}%` } },
        },
      ],
    });

    res.status(STATUS_CODES.SUCCESS).json({
      total: totalTemplates,
      page: Number(page),
      limit: Number(limit),
      templates: filteredTemplates.map((template) => ({
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
