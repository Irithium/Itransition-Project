const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("HERE GOES THE AUTH ROUTES");
});

module.exports = router;
