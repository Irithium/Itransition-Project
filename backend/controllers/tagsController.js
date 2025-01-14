const { Tags, Templates, Topics, TemplateLikes, Users } = require("../models");
const { STATUS_CODES } = require("../constants");
const { formatLastActivity } = require("../utils/dateFormatter_utils");

exports.createTags = async (req, res) => {
  const tags = req.body;

  try {
    const newTags = await tags.map(async (tag) => {
      await Tags.create({ title: tag.name });
    });

    res.status(STATUS_CODES.CREATED).json({
      tags: newTags,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TAGS.LOAD_FAILED") });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tags.findAll({
      attributes: ["id", "title"],
    });

    res.status(STATUS_CODES.SUCCESS).json(tags);
  } catch (error) {
    return handleError(
      res,
      STATUS_CODES.SERVER_ERROR,
      error,
      req.t("ERROR_MESSAGES.TAGS.LOAD_FAILED")
    );
  }
};

exports.getTemplatesByTag = async (req, res) => {
  const { tagId } = req.params;

  try {
    const tag = await Tags.findByPk(tagId, {
      include: [
        {
          model: Templates,
          through: { attributes: [] },
          include: [
            { model: Users, attributes: ["username"] },
            { model: Topics, attributes: ["name"] },
            {
              model: TemplateLikes,
              attributes: ["id"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!tag) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TAGS.NOT_FOUND") });
    }

    const templates = tag.Templates.map((template) => ({
      id: template.id,
      title: template.title,
      description: template.description,
      imageUrl: template?.image_url || null,
      authorId: template.authorId,
      author: template.User.username,
      likes: template.likes.length || 0,
      responses: template.responses.length || 0,
      topicId: template.topicId,
      tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
      createdAt: formatLastActivity(template.createdAt),
      updatedAt: formatLastActivity(template.updatedAt),
    }));

    req.user.updatedAt = new Date();
    await req.user.save();

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

exports.updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const tag = await Tags.findByPk(id);
    if (!tag) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TAGS.NOT_FOUND") });
    }

    await tag.update({ name });

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.TAGS.UPDATED"),
      tag,
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

exports.deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tags.findByPk(id);
    if (!tag) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TAGS.NOT_FOUND") });
    }

    await tag.destroy();

    req.user.updatedAt = new Date();
    await req.user.save();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.TAGS.DELETED"),
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
