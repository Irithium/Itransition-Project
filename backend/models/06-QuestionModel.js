const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Questions extends Model {
    static associate(models) {
      Questions.belongsTo(models.Templates, { foreignKey: "templateId" });
      Questions.hasMany(models.Forms, { foreignKey: "questionId" });
    }
  }

  Questions.init(
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
      },
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      questionType: {
        type: DataTypes.ENUM(
          "single-line",
          "multiple-line",
          "integer",
          "checkbox"
        ),
        allowNull: false,
      },
      isVisible: {
        type: DataTypes.ENUM("NOT_VISIBLE", "OPTIONAL", "VISIBLE"),
        defaultValue: "NOT_VISIBLE",
      },
    },
    {
      sequelize,
      modelName: "Questions",
      timestamps: true,
    }
  );

  return Questions;
};
