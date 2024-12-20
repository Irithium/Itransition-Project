const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TemplateLikes extends Model {
    static associate(models) {
      TemplateLikes.belongsTo(models.Users, { foreignKey: "userId" });
      TemplateLikes.belongsTo(models.Templates, { foreignKey: "templateId" });
    }
  }

  TemplateLikes.init(
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
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TemplateLikes",
      timestamps: true,
    }
  );

  return TemplateLikes;
};
