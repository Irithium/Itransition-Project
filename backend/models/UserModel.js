"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Users extends Model {
    static associate(models) {
      User.hasMany(models.Templates, { foreignKey: "authorId" });
      User.hasMany(models.Comments, { foreignKey: "userId" });
      User.hasMany(models.CommentLikes, { foreignKey: "userId" });
      User.hasMany(models.TemplateLikes, { foreignKey: "userId" });
      User.hasMany(models.Forms, { foreignKey: "userId" });
    }
  }

  Users.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Users",
      timestamps: true,
    }
  );
};
