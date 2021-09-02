/** @format */

const { randomInt } = require("mathjs");

const pronumerals = ["a", "y", "x", "z", "e"];
module.exports = {name: "algebra",execute: (amountOfQuestions, low, high) => {
  let questions = [];
  for (let i = 0; i < amountOfQuestions; i++) {
    let x = randomInt(low, high);
    let multiplier = randomInt(1, 5);
    let amount = randomInt(low, high);
    let firstA = x * multiplier - amount;
    questions.push({
      question: `${multiplier}${
        pronumerals[randomInt(0, pronumerals.length)]
      } - ${amount} = ${firstA}`,
      answer: x,
    });
  }
  return questions;
}}
