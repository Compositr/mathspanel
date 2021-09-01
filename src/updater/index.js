/** @format */

const got = require("got");
const compare = require("compare-versions");

const url = "https://raw.githubusercontent.com/";

module.exports = async (ver) => {
  await got(
    `${url}/${encodeURIComponent("CoolJim")}/${encodeURIComponent(
      "mathspanel"
    )}/${encodeURIComponent("main")}/${encodeURIComponent("package.json")}`,
    (err, res) => {
      if (err) console.error(err);
      const version = JSON.parse(res).version;
      return compare(version, ver) === 1 ? version : false;
    }
  );
};
