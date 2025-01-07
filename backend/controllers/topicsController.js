const { Topics } = require("../models");
const { STATUS_CODES } = require("../constants");

const convertToUpperUnderscore = (str) =>
  str.toUpperCase().replace(/\s+/g, "_");

exports.createTopic = async (req, res) => {
  const topics = req.body;
  try {
    const newTopics = await topics.map(async (topic) => {
      await Topics.create({
        title: topic.name,
      });
    });

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.TOPIC.CREATED"),
      topics: newTopics,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TOPIC.CREATION_ERROR") });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const topics = await Topics.findAll({
      attributes: ["id", "title"],
    });

    const formattedTopics = topics.map((topic) => {
      topic.title = convertToUpperUnderscore(topic.title);

      return {
        id: topic.id,
        title: req.t(`TOPICS.${topic.title}`),
      };
    });

    res.status(STATUS_CODES.SUCCESS).json(formattedTopics);
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TOPIC.LOAD_FAILED") });
  }
};

exports.deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const topic = await Topics.findByPk(id);
    if (!topic) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: req.t("ERROR_MESSAGES.TOPIC.NOT_FOUND") });
    }

    await topic.destroy();

    res.status(STATUS_CODES.SUCCESS).json({
      message: req.t("SUCCESS_MESSAGES.TOPIC.DELETED"),
    });
  } catch (error) {
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.TOPIC.DELETING_ERROR") });
  }
};
