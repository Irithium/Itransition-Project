const { Questions, Options } = require("../models");
const _ = require("lodash");

exports.createOrUpdateQuestions = async (questions, templateId, req) => {
  const currentQuestions = await Questions.findAll({
    where: { templateId },
  });

  const questionsToKeep = [];
  for (const question of currentQuestions) {
    const updatedQuestion = questions.find((q) => q.id === question.id);
    if (updatedQuestion) {
      if (question.isDeleted) {
        await question.update({ isDeleted: false });
      }

      console.log(question);
      console.log(updatedQuestion);
      if (
        question.questionType === "checkbox" &&
        updatedQuestion.questionType !== "checkbox"
      ) {
        await Options.destroy({ where: { questionId: question.id } });
      }

      await question.update(updatedQuestion);
      questionsToKeep.push(question.id);

      if (
        updatedQuestion.questionType === "checkbox" &&
        !_.isEmpty(updatedQuestion.options)
      ) {
        await Options.destroy({ where: { questionId: question.id } });
        for (const option of updatedQuestion.options) {
          await Options.create({
            title: option.title,
            value: option.value,
            questionId: question.id,
          });
        }
      } else if (
        updatedQuestion.questionType === "checkbox" &&
        _.isEmpty(updatedQuestion.options)
      ) {
        throw new Error(req.t("ERROR_MESSAGES.OPTION.NOT_FOUND"));
      }
    } else {
      await question.update({ isDeleted: true });
    }
  }

  for (const question of questions) {
    if (!questionsToKeep.some((q) => q === question.id)) {
      const newQuestion = await Questions.create({
        title: question.title,
        description: question.description,
        questionType: question.questionType,
        isVisible: question.isVisible,
        templateId,
      });

      if (
        question.questionType === "checkbox" &&
        !_.isEmpty(question.options)
      ) {
        for (const option of question.options) {
          await Options.create({
            title: option.title,
            value: option.value,
            questionId: newQuestion.id,
          });
        }
      } else if (
        question.questionType === "checkbox" &&
        _.isEmpty(question.options)
      ) {
        throw new Error(req.t("ERROR_MESSAGES.OPTION.NOT_FOUND"));
      }
    }
  }

  const updatedQuestions = await Questions.findAll({
    where: {
      templateId,
      isDeleted: false,
    },
    order: [["order", "ASC"]],
  });

  for (let i = 0; i < updatedQuestions.length; i++) {
    await updatedQuestions[i].update({ order: i + 1 });
  }
};
