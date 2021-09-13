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
      let userFriendlyError = "The file did not save correctly."
      console.log(`User cancelled save or something went wrong! Error ${err}`);
      if(err.toString().includes("ENOENT")) return;
      if(err.toString().includes("EBUSY")) userFriendlyError = "Another program has the file opened. This has prevented Maths Panel from overwriting it!"
      if(err.toString().includes("EACCES")) userFriendlyError = "You don't have the appropriate permissions to write the file there!"
      dialog.showMessageBox({
        title: "An error occured whilst trying to save a file!",
        message: `We're sorry, but an error occured whilst trying to save that file. ${userFriendlyError}`,
        type: "error"
      })
    }
  },
};
