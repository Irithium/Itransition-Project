const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Comments extends Model {
    static associate(models) {
      Comments.belongsTo(models.Users, {
        foreignKey: "authorId",
        as: "author",
      });
      Comments.belongsTo(models.Templates, { foreignKey: "templateId" });
      Comments.hasMany(models.CommentLikes, {
        foreignKey: "commentId",
        as: "likes",
      });
    }
  }

  Comments.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Comments",
      timestamps: true,
    }
  );

  return Comments;
};
