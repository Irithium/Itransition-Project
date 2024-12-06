const cors = require("cors");
const express = require("express");
const passport = require("passport");
const app = require("./router/router.js");

require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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

startServer();
