const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const path = require("path");

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "es", "pt"],
    backend: {
      loadPath: path.resolve(__dirname, "../locales/{{lng}}.json"),
    },
    detection: {
      order: ["cookie", "header"],
      caches: ["cookie", "header"],
    },
  });

module.exports = i18next;
