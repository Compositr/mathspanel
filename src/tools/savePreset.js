/** @format */

const db = require("../database/index");
module.exports = {
  name: "presetForm",
  execute(formData) {
    const presets = db.get("presetsv2");
    console.log(formData);
    const sanitised = formData["name"].replaceAll(" ", "-");
    if (!presets) {
      db.set("presetsv2", [
        {
          name: formData.name,
          sanitised,
          type: formData.type,
          lower: formData.min,
          upper: formData.max,
          questions: formData.questions,
        },
      ]);
    } else {
      presets.push({
        name: formData.name,
        sanitised,
        type: formData.type,
        lower: formData.min,
        upper: formData.max,
        questions: formData.questions,
      });
      db.set("presetsv2", presets);
    }
  },
};
