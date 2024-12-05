const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("HERE GOES THE FORMS ROUTES");
});

module.exports = router;
