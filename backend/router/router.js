const express = require("express");
const morgan = require("morgan");
const authRouter = require("./authRouter");
const usersRouter = require("./usersRouter");
const topicsRouter = require("./topicsRouter");
const templatesRouter = require("./templatesRouter");
const commentsRouter = require("./commentsRouter");
const formsRouter = require("./formsRouter");
const tagsRouter = require("./tagsRouter");
const { API_ENDPOINTS } = require("../constants");
require("dotenv").config();

const router = express.Router();

router.use(API_ENDPOINTS.AUTH, authRouter);
router.use(API_ENDPOINTS.USERS, usersRouter);
router.use(API_ENDPOINTS.TOPICS, topicsRouter);
router.use(API_ENDPOINTS.TEMPLATES, templatesRouter);
router.use(API_ENDPOINTS.TAGS, tagsRouter);
router.use(API_ENDPOINTS.FORMS, formsRouter);
router.use(API_ENDPOINTS.COMMENTS, commentsRouter);

router.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
