/** @format */

const { randomInt } = require("mathjs");
module.exports = {
  name: "multiplication",
  execute: (questionAmount, low, high) => {
    const questions = [];
    for (let index = 0; index < questionAmount; index++) {
      const first = randomInt(low, high);
      const last = randomInt(low, high);
      questions.push({
        answer: first * last,
        question: `${first} × ${last} =`,
      });
    }
    return questions;
  },
};
