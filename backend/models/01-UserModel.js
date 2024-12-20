"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Templates, { foreignKey: "authorId" });
      Users.hasMany(models.Comments, { foreignKey: "userId" });
      Users.hasMany(models.CommentLikes, { foreignKey: "userId" });
      Users.hasMany(models.TemplateLikes, { foreignKey: "userId" });
      Users.hasMany(models.Forms, { foreignKey: "userId" });
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
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Users",
      timestamps: true,
    }
  );

  return Users;
};
