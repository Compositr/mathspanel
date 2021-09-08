/** @format */

const { dialog } = require("electron");
const fs = require("fs");
module.exports = {
  name: "buffer",
  /**
   * Prompt user to save a file
   * @param {string} event Event name (optional)
   * @param {Buffer} data Buffer to prompt user to save
   */
  async execute(event, data) {
    const buffer = data.payload;
    const dir = await dialog.showSaveDialog({
      title: "Save new worksheet",
      defaultPath: "worksheet.pdf",
      buttonLabel: "Save worksheet",
    });
    try {
      fs.writeFileSync(dir.filePath, buffer);
    } catch (err) {
      console.log(`User cancelled save! Error ${err}`);
    }
  },
};
