const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TemplateTags extends Model {
    static associate(models) {
      TemplateTags.belongsTo(models.Templates, { foreignKey: "templateId" });
      TemplateTags.belongsTo(models.Tags, { foreignKey: "tagId" });
    }
  }

  TemplateTags.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      templateId: {
        type: DataTypes.UUID,

        primaryKey: true,
      },
      tagId: {
        type: DataTypes.UUID,

        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "TemplateTags",
      timestamps: true,
    }
  );

  return TemplateTags;
};
