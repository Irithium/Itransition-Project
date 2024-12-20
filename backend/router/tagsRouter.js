const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("HERE GOES THE TAG ROUTES");
});

module.exports = router;
