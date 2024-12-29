const router = require("express").Router();
const topicsController = require("../controllers/topicsController");

router.post("/", topicsController.createTopic);
router.get("/", topicsController.getTopics);
router.delete("/:id", topicsController.deleteTopic);

module.exports = router;
