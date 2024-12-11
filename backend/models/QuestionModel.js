const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Questions extends Model {
    static associate(models) {
      Questions.belongsTo(models.Templates, { foreignKey: "templateId" });
      Questions.hasMany(models.Answers, { foreignKey: "questionId" });
    }
  }

  Questions.init({
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
    questionType: {
      type: DataTypes.ENUM(
        "single-line",
        "multiple-line",
        "integer",
        "checkbox"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("required", "option", "not_used"),
      allowNull: false,
    },
  });
};
