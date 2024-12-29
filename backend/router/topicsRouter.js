const router = require("express").Router();
const topicController = require("../controllers/topicController");

router.post("/", topicController.createTopic);
router.get("/", topicController.getTopics);
router.delete("/:id", topicController.deleteTopic);

module.exports = router;
