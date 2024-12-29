const { Topics } = require("../models");
const { STATUS_CODES } = require("../constants");

exports.createTopic = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newTopic = await Topics.create({
      name,
      description,
    });

    res.status(STATUS_CODES.CREATED).json({
      message: req.t("SUCCESS_MESSAGES.TOPIC.CREATED"),
      topic: newTopic,
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
      attributes: ["id", "name"],
    });

    res.status(STATUS_CODES.SUCCESS).json(topics);
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
