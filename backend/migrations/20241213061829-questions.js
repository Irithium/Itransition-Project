"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Questions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      questionType: {
        type: Sequelize.ENUM(
          "single-line",
          "multiple-line",
          "integer",
          "checkbox"
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "NOT_PRESENT",
          "PRESENT_OPTIONAL",
          "PRESENT_REQUIRED"
        ),
        defaultValue: "NOT_PRESENT",
      },
      templateId: {
        type: Sequelize.UUID,
        references: {
          model: "Templates",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Questions");
  },
};
