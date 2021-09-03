/** @format */
const { version } = require("../package.json");
const { remote, ipcRenderer } = require("electron");
const { dialog } = remote;
const { writeFile } = require("fs");
const { jsPDF } = require("jspdf");
const $ = require("jquery");
const fs = require("fs");
const path = require("path");
const db = require("./database/index");

/**
 * ---------------------------------
 * Automatic worksheet handler
 * ---------------------------------
 */

const generators = {};
// Get files in ./generators
const generatorFiles = fs
  .readdirSync(path.join(__dirname, "./generators"))
  .filter((f) => f.endsWith(".js"));
for (const file of generatorFiles) {
  const generator = require(path.join(__dirname, `./generators/${file}`));
  generators[generator.name] = generator;
}
for (const generator in generators) {
  if (Object.hasOwnProperty.call(generators, generator)) {
    const element = generators[generator];
    document.getElementById(element.name).onclick = () => {
      const form = fetchForm();
      if (!form.get("higher").length || !form.get("lower").length) {
        $("#missingFields").show();
        $("#missingFields").on("click", () => {
          $("#missingFields").hide();
        });
        return;
      }
      makePDF(
        element.execute(
          form.get("questions") || 30,
          form.get("lower"),
          form.get("higher")
        ),
        capitalize(element.name)
      );
    };
  }
}

/**
 * --------------------
 * Preset handler
 * --------------------
 */

$("#save").on("click", () => {
  console.log("Save button clicked");
  $("#saveModal").show();
  const form = fetchForm();
  // Check for missing fields
  if (!form.get("higher").length || !form.get("lower").length) {
    console.log("Missing fields");
    $("#missingFields").show();
    $("#missingFields").on("click", () => {
      $("#missingFields").hide();
    });
    return;
  }
  const presets = db.get("presets");

  if (!presets) {
    $("#saveButton").on("click", () => {
      $("#saveModal").hide();
      const name = new FormData(document.querySelector("form#saveForm")).get(
        "name"
      );
      const saveForm = new FormData(document.querySelector("form#saveForm"));
      db.set("presets", [
        {
          name,
          type: saveForm.get("type").toLocaleLowerCase(),
          higher: form.get("higher"),
          lower: form.get("lower"),
          questions: form.get("questions") || 30,
        },
      ]);
    });
  } else {
    $("#saveButton").on("click", () => {
      $("#saveModal").hide();
      const name = new FormData(document.querySelector("form#saveForm")).get(
        "name"
      );
      const saveForm = new FormData(document.querySelector("form#saveForm"));
      presets.push({
        name,
        higher: form.get("higher"),
        lower: form.get("lower"),
        questions: form.get("questions") || 30,
      });
    });
  }
});

// Load preset buttons
const presets = db.get("presets");
if (!presets) $("#presetsBox").hide();
else {
  for (const preset of presets) {
    $("#presetsBox").append(
      `<button class="btn btn-primary" id="preset-${preset.name}">${preset.name}</button>`
    );

    $(`#preset-${preset.name}`).attr("data-name", preset.name);
    $(`#preset-${preset.name}`).on("click", () => {
      const name = $(`#preset-${preset.name}`).data("name");
      const thisPreset = db.get("presets").find((e) => e.name === name);
      console.table(generators);
      makePDF(
        generators[thisPreset.type].execute(
          thisPreset.questions,
          thisPreset.lower,
          thisPreset.higher
        ),
        capitalize(thisPreset.type)
      );
    });
  }
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

/**
 * --------------------
 * Fetch form data
 * --------------------
 */
function fetchForm() {
  return new FormData(document.querySelector("form#query"));
}

/**
 * ----------------------------------------------------------------------
 * Visually indicate that the app is busy (show and hide #busy)
 * ----------------------------------------------------------------------
 */

function showBusy() {
  document.getElementById("busy").style.display = "block";
}
function ceaseBusy() {
  document.getElementById("busy").style.display = "none";
}

/**
 * --------------------
 * Update Detection
 * --------------------
 */

async function updateCheck() {
  const needsUpdate = await require("./updater/index")(version);
  if (needsUpdate) {
    document.getElementById("updateAlert").style.display = "block";
    document.getElementById("updateVersion").innerHTML = needsUpdate;
  } else {
    document.getElementById("updateAlert").style.display = "none";
  }
}
updateCheck();

/**
 * ------------------------------
 * Fill in version areas
 * ------------------------------
 */
console.log(`Running mathsgen version ${version}`);
$("span.version").text(version);

/**
 * ----------------------
 * Helper functions
 * ----------------------
 */
function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}
