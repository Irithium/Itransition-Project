const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const passport = require("passport");
const router = require("./router/router.js");
const cookieParser = require("cookie-parser");
const i18next = require("./utils/translate.js");
const i18nextMiddleware = require("i18next-http-middleware");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware.handle(i18next));
app.use(passport.initialize());

app.use("/api", router);

const startServer = async () => {
  try {
    console.log("Connection has been established successfully.");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port:${port}.`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(req.t("error_message"));
});

startServer();
