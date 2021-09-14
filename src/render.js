/** @format */
const { version } = require("../package.json");
const { ipcRenderer } = require("electron");
const $ = require("jquery");
const fs = require("fs");
const path = require("path");
const savePreset = require("./tools/savePreset").execute;
const db = require("./database/index");
const { title } = require("process");


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
// Listen for modal button press
$("#submitWorksheetModal").on("click", () => {
  const formData = {};
  const serialformData = $("#worksheetModalForm").serializeArray();
  serialformData.forEach((e) => {
    formData[e.name] = e.value;
  });
  makePDF(
    generators[formData.type].execute(
      formData.questions,
      formData.min,
      formData.max
    ),
    capitalize(formData.type)
  );
});

/**
 * --------------------
 * Preset save handler
 * --------------------
 */
$("#submitPresetModal").on("click", () => {
  const formData = {};
  const serialFormData = $("#presetModalForm").serializeArray();
  serialFormData.forEach((e) => {
    formData[e.name] = e.value;
  });
  console.table(formData);
  console.log(serialFormData);
  savePreset(formData);
});

/**
 * --------------------
 * Preset loader
 * --------------------
 */

const presets = db.get("presetsv2");
if (!presets) $("#presetsBox").hide();
else {
  for (const preset of presets) {
    $("#presetsBox").append(
      `<button class="btn btn-outline-primary w-100" id="preset-${preset.sanitised}">${preset.name}</button>`
    );

    $(`#preset-${preset.sanitised}`).attr("data-name", preset.name);
    $(`#preset-${preset.sanitised}`).on("click", () => {
      const name = $(`#preset-${preset.sanitised}`).data("name");
      const thisPreset = db.get("presetsv2").find((e) => e.name === name);
      makePDF(
        generators[thisPreset.type].execute(
          thisPreset.questions,
          thisPreset.lower,
          thisPreset.upper
        ),
        capitalize(thisPreset.type)
      );
    });
  }
}

/**
 * Make a PDF from a set of questions
 * @param {Object[]} questions Array of Question objects
 * @param {String} type Type of worksheet
 */
async function makePDF(questions, type) {
  ipcRenderer.send("main", { event: "makePDF", questions, type });
}

/**
 * --------------------
 * ipc reply handler
 * --------------------
 */
const replyTypes = ["version", "update", "data"];
const ipcs = {};
const ipcFiles = fs
  .readdirSync(path.join(__dirname, "./ipc-reply"))
  .filter((f) => f.endsWith(".js"));
for (const file of ipcFiles) {
  const ipc = require(path.join(__dirname, `./ipc-reply/${file}`));
  ipcs[ipc.event] = ipc;
}
ipcRenderer.on("reply", (event, data) => {
  const { type } = data;
  if (!replyTypes.includes(type))
    throw new Error(`${type} is not a valid type`);
  for (const ipc in ipcs) {
    if (Object.hasOwnProperty.call(ipcs, ipc)) {
      const element = ipcs[ipc];
      if (element.name === type) {
        element.execute(event, data);
      }
    }
  }
});

/**
 * --------------------
 * Fetch form data
 * --------------------
 */
function fetchForm() {
  return new FormData(document.querySelector("form#query"));
}
/**
 * --------------------
 * Update Detection
 * --------------------
 */

ipcRenderer.send("background", { event: "updateCheck" });

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

/**
 * ------------------------------
 * css:sticky workaround
 * ------------------------------
 */
window.addEventListener(
  "scroll",
  (event) => {
    const stickyShim = event.target.querySelector(".sticky-workaround");
    if (stickyShim) {
      stickyShim.style.position = "relative";
      stickyShim.offsetHeight;
      stickyShim.style.position = "";
    }
  },
  true
);

/**
 * ------------------------------
 * Tooltips and popovers
 * ------------------------------
 */
var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl);
});

/**
 * --------------------
 * Popover tour
 * --------------------
 */
if(!db.get("tourDone")) {
introJs().setOptions({
  steps: [
    {
      title: "Welcome",
      intro: "👋 Hello there! Let's get you familiarised with Maths Panel... So what is Maths Panel anyways?\nMaths Panel is a simple app designed to generate maths worksheets. Lets get you familiarised with the app then!",
    },
    {
      element: document.querySelector("#createWorksheetButton"),
      title: "Creating worksheets",
      intro: "To create a worksheet, click here and fill in the fields."
    },
    {
      element: document.querySelector("#createTemplateButton"),
      title: "Templates? What are they?",
      intro: "Temaplates allow you to save a premade worksheet 'template' with predetermined fields, so you can instantly and quickly generate a worksheet of a specific type in a click of a button"
    },
    {
      element: document.querySelector("#infoNavbarLink"),
      title: "More info",
      intro: "More information found on that page!"
    }
  ],
}).start();
db.set("tourDone", 1)
}