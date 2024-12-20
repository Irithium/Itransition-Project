const { formatDistanceToNow } = require("date-fns");

function formatLastActivity(lastActivityDate) {
  if (!lastActivityDate) return "Never";

  const lastActivity = new Date(lastActivityDate);
  return formatDistanceToNow(lastActivity, { addSuffix: true });
}

module.exports = {
  formatLastActivity,
};
