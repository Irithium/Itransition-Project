const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CommentLikes extends Model {
    static associate(models) {
      CommentLikes.belongsTo(models.Users, { foreignKey: "userId" });
      CommentLikes.belongsTo(models.Comments, { foreignKey: "commentId" });
    }
  }

  CommentLikes.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      commentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CommentLikes",
      timestamps: true,
    }
  );

  return CommentLikes;
};
