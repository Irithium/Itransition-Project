const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Templates extends Model {
    static associate(models) {
      Template.belongsTo(models.Users, { foreignKey: "authorId" });
      Template.belongsTo(models.Topics, { foreignKey: "topicId" });
      Template.hasMany(models.Questions, { foreignKey: "templateId" });
      Template.hasMany(models.Forms, { foreignKey: "templateId" });
      Template.hasMany(models.Comments, { foreignKey: "templateId" });
      Template.hasMany(models.TemplateLikes, { foreignKey: "templateId" });
      Template.hasMany(models.Answers, { foreignKey: "templateId" });
      Template.belongsToMany(models.Tags, {
        through: "TemplateTags",
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
    },
    {
      sequelize,
      modelName: "Templates",
      timestamps: true,
    }
  );
};
