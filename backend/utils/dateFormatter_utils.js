const { formatDistanceToNow } = require("date-fns");

function dateFormatter(lastActivityDate) {
  if (!lastActivityDate) return "Never";

  const lastActivity = new Date(lastActivityDate);
  return formatDistanceToNow(lastActivity, { addSuffix: true });
}

module.exports = {
  dateFormatter,
};
