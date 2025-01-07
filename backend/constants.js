const API_ENDPOINTS = {
  AUTH: "/auth",
  USERS: "/users",
  TOPICS: "/topics",
  TEMPLATES: "/templates",
  TAGS: "/tags",
  FORMS: "/forms",
  COMMENTS: "/comments",
  LIKES: "/likes",
  UPLOAD: "/upload",
};

const STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
};

const DB_DIALECT = "mysql";

module.exports = {
  API_ENDPOINTS,
  STATUS_CODES,
  DB_DIALECT,
};
