const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Topics extends Model {
    static associate(models) {
      Topics.hasMany(models.Templates, { foreignKey: "topicId" });
    }
  }

  Topics.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Topics",
      timestamps: true,
    }
  );

  return Topics;
};
