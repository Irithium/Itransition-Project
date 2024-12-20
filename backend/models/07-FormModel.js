const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Forms extends Model {
    static associate(models) {
      Forms.belongsTo(models.Users, { foreignKey: "userId" });
      Forms.belongsTo(models.Templates, { foreignKey: "templateId" });
      Forms.belongsTo(models.Questions, { foreignKey: "questionId" });
    }
  }

  Forms.init(
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
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Forms",
      timestamps: true,
    }
  );

  return Forms;
};
