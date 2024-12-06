const { DB_DIALECT } = require("../constants.js");

require("dotenv").config();

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: DB_DIALECT,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: DB_DIALECT,
  },
};
