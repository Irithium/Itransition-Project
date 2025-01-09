const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Options extends Model {
    static associate(models) {
      Options.belongsTo(models.Questions, { foreignKey: "questionId" });
    }
  }

  Options.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Options",
      timestamps: true,
    }
  );

  return Options;
};
