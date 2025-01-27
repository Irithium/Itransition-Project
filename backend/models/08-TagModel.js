const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Tags extends Model {
    static associate(models) {
      Tags.belongsToMany(models.Templates, {
        through: models.TemplateTags,
        foreignKey: "tagId",
      });
    }
  }

  Tags.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Tags",
      timestamps: true,
    }
  );

  return Tags;
};
