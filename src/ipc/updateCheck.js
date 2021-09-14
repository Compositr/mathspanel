const got = require("got");
const compare = require("compare-versions");
const { version } = require("../../package.json");

const url = "https://raw.githubusercontent.com/";

module.exports = {
  event: "updateChecker",
  channel: "background",
  async execute(event, data) {
    const update = JSON.parse(
      await got(
        `${url}/${encodeURIComponent("CoolJim")}/${encodeURIComponent(
          "mathspanel"
        )}/${encodeURIComponent("main")}/${encodeURIComponent("package.json")}`
      )
    ).version;
    console.log(update);
    event.reply("reply", {
      type: "version",
      payload: compare(version, update) === -1 ? update : false,
    });
  },
};
