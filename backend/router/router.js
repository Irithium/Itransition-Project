const express = require("express");
const morgan = require("morgan");
const authRouter = require("./authRouter");
const usersRouter = require("./usersRouter");
const templatesRouter = require("./templatesRouter");
const formsRouter = require("./formsRouter");
require("dotenv").config();

const app = express();
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/forms", formsRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
