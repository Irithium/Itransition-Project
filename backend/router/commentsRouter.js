const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("HERE GOES THE COMMENTS ROUTES");
});

module.exports = router;
