const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Templates extends Model {
    static associate(models) {
      Templates.belongsTo(models.Users, {
        as: "author",
        foreignKey: "authorId",
      });
      Templates.belongsTo(models.Topics, { foreignKey: "topicId" });
      Templates.hasMany(models.Questions, { foreignKey: "templateId" });
      Templates.hasMany(models.Forms, { foreignKey: "templateId" });
      Templates.hasMany(models.Comments, { foreignKey: "templateId" });
      Templates.hasMany(models.TemplateLikes, {
        foreignKey: "templateId",
        as: "likes",
      });
      Templates.belongsToMany(models.Tags, {
        through: models.TemplateTags,
        foreignKey: "templateId",
      });
    }
  }

  Templates.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      authorId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      accessSettings: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Templates",
      timestamps: true,
    }
  );

  return Templates;
};
