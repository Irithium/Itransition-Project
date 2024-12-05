const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("HERE GOES THE USER ROUTES");
});

module.exports = router;
