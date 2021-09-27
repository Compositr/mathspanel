/** @format */

const { getRndInteger } = require("utilities/build").default;

module.exports = {
  name: "addition",
  execute: (questionAmount, low, high) => {
    const questions = [];
    for (let index = 0; index < questionAmount; index++) {
      const first = getRndInteger(low, high);
      const last = getRndInteger(low, high);
      questions.push({
        answer: first + last,
        question: `${first} + ${last} =`,
      });
    }
    return questions;
  },
};
