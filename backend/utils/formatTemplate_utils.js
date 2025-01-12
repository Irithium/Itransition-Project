const { dateFormatter } = require("./dateFormatter_utils");

exports.formatTemplate = (template) => ({
  id: template.id,
  title: template.title,
  description: template.description,
  imageUrl: template?.image_url || null,
  authorId: template.authorId,
  author: template.author ? template.author.username : null,
  topicId: template.topicId,
  tagsId: template.Tags ? template.Tags.map((tag) => tag.id) : [],
  likes: template.likes.length || 0,
  responses: template.Forms ? template.Forms.length : 0,
  createdAt: template.createdAt,
  updatedAt: template.updatedAt,
});

exports.formatTemplateDates = (template) => ({
  ...template,
  createdAt: dateFormatter(template.createdAt),
  updatedAt: dateFormatter(template.updatedAt),
});
