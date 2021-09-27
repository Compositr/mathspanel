/** @format */

const { getRndInteger: randomInt } = require("utilities/build").default;
module.exports = {
  name: "subtraction",
  execute: (questionAmount, low, high) => {
    const questions = [];
    for (let index = 0; index < questionAmount; index++) {
      let first = randomInt(low, high);
      let last = randomInt(low, high);
      while (first < last) {
        first = randomInt(low, high);
        last = randomInt(low, high);
      }
      questions.push({
        answer: first - last,
        question: `${first} - ${last} =`,
      });
    }
    return questions;
  },
};
