/** @format */

const { randomInt } = require("mathjs");
module.exports = {name: "division",execute: (questionAmount, low, high) => {
  const questions = [];
  for (let index = 0; index < questionAmount; index++) {
    let first = randomInt(low, high);
    let last = randomInt(low, high);
    // Check whether first < last or first / last is going to have a decimal
    while (first < last || first / last - Math.floor(first / last) !== 0) {
      first = randomInt(low, high);
      last = randomInt(low, high);
    }
    questions.push({
      answer: first / last,
      question: `${first}÷${last} =`,
    });
  }
  return questions;
}}
