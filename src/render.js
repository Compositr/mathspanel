/** @format */
const { version } = require("../package.json");
const { ipcRenderer } = require("electron");
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
  if (
    !form.get("higher") + "".length ||
    !form.get("lower") + "".length /* Cocerce into string */
  ) {
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
      const name =
        new FormData(document.querySelector("form#saveForm")).get("name") + ""; // Coerce into string
      const saveForm = new FormData(document.querySelector("form#saveForm"));
      /**
       * Sanitise user input
       */
      const sanitised = name.replaceAll(" ", "-");
      db.set("presets", [
        {
          name,
          sanitised,
          type: saveForm.get("type") + "".toLocaleLowerCase(),
          higher: form.get("higher") + "",
          lower: form.get("lower") + "",
          questions: +form.get("questions") || 30,
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
      const sanitised = name.replaceAll(" ", "-");
      console.log(saveForm.get("type"));
      presets.push({
        name,
        sanitised,
        type: saveForm.get("type") + "".toLocaleLowerCase(),
        higher: form.get("higher"),
        lower: form.get("lower"),
        questions: form.get("questions") || 30,
      });
      db.set("presets", presets);
    });
  }
});

// Load preset buttons
const presets = db.get("presets");
if (!presets) $("#presetsBox").hide();
else {
  for (const preset of presets) {
    $("#presetsBox").append(
      `<button class="btn btn-primary" id="preset-${preset.sanitised}">${preset.name}</button>`
    );

    $(`#preset-${preset.sanitised}`).attr("data-name", preset.name);
    $(`#preset-${preset.sanitised}`).on("click", () => {
      const name = $(`#preset-${preset.sanitised}`).data("name");
      const thisPreset = db.get("presets").find((e) => e.name === name);
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
  ipcRenderer.send("main", { questions, type });
}

/**
 * --------------------
 * ipc reply handler
 * --------------------
 */
const replyTypes = ["version", "update"];
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

/**
 * ----------
 * Tooltips
 * ----------
 */
$(function () {
  $('[data-toggle="tooltip"]').tooltip({
    template:
      '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
  });
});
