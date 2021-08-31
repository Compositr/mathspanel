/** @format */
const { remote } = require("electron");
const { dialog } = remote;
const { writeFile } = require("fs");
const { jsPDF } = require("jspdf");

const addition = document.getElementById("addition");
const subtraction = document.getElementById("subtraction");
const multiplication = document.getElementById("multiplication");
const division = document.getElementById("division");
multiplication.onclick = multiplicationSheet;
addition.onclick = additionSheet;
subtraction.onclick = subtractionSheet;
division.onclick = divisionSheet;

function subtractionSheet() {
  showBusy();
  const form = fetchForm();
  const questions = require("./generators/minus")(
    form.get("questions"),
    form.get("lower"),
    form.get("higher")
  );
  makePDF(questions, "Subtraction");
  ceaseBusy();
}

function divisionSheet() {
  showBusy();
  const form = fetchForm();
  const questions = require("./generators/divide")(
    form.get("questions"),
    form.get("lower"),
    form.get("higher")
  );
  ceaseBusy();
}

function multiplicationSheet() {
  showBusy();
  const form = fetchForm();
  const questions = require("./generators/times")(
    form.get("questions"),
    form.get("lower"),
    form.get("higher")
  );
  makePDF(questions, "Multiplication");
  ceaseBusy();
}

function additionSheet() {
  const form = fetchForm();
  const questions = require("./generators/add")(
    form.get("questions"),
    form.get("lower"),
    form.get("higher")
  );
  makePDF(questions, "Addition");
}

async function makePDF(questions, type) {
  showBusy();
  // Timestamp Logic
  const d = new Date();
  const genMonth = new Intl.DateTimeFormat("en-AU", { month: "long" }).format(
    d
  );
  const genYear = new Intl.DateTimeFormat("en-AU", {
    year: "numeric",
  }).format(d);

  const doc = new jsPDF({
    orientation: "p",
    unit: "cm",
  });
  doc.setFont("Times");
  doc.setFontSize(24);
  doc.text(`${type} Worksheet`, 1, 2);
  doc.setFontSize(12);
  doc.text(`Generated ${d.getDate()}, ${genMonth} ${genYear}`, 1, 2.7);

  // Generate first page
  let top = 3;
  let n = 0;

  for (let index = 0; index < questions.length; index++) {
    const e = questions[index];
    if (n % 5 == 0) {
      top += 2;
      n = 0;
    }
    doc.text(`Q${index + 1}. ${e.question}`, n * 4 + 1, top);
    n++;
  }
  // Answer page
  doc.addPage();
  doc.text("Answer Key", 1, 1);
  let x = 0;
  let fromTop = 3;
  for (let i = 0; i < questions.length; i++) {
    if (x % 6 == 0) {
      fromTop += 2;
      x = 0;
    }
    const element = questions[i];

    doc.text(`A${i + 1}. ${element.answer}`, x * 4 + 1, fromTop);
    x++;
  }
  ceaseBusy();
  // Output document as blob and get user to save it
  const buffer = Buffer.from(await doc.output("blob").arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save worksheet",
    defaultPath: "worksheet.pdf",
  });
  writeFile(filePath, buffer, () => console.log("Wrote file!"));
}

function fetchForm() {
  return new FormData(document.querySelector("form"));
}

function showBusy() {
  document.getElementById("busy").style.display = "block";
}
function ceaseBusy() {
  document.getElementById("busy").style.display = "none";
}
