/** @format */

const fs = require("fs");

/**
 * Check for file existence
 */

try {
  fs.readFileSync("storage.dat");
} catch {
  fs.writeFileSync("storage.dat", `{}`);
}
const file = fs.readFileSync("storage.dat", { encoding: "utf-8" });

/**
 * Set a new key-value pair in the JSON file
 * @return Throws error on error, otherwise returns true
 * @param {string} key Key to set
 * @param {any} value Value of the key
 */

module.exports.set = (key, value) => {
  if (key === undefined) throw new Error("Key is undefined");
  let jsonFile = JSON.parse(file);
  jsonFile[key] = value;
  fs.writeFileSync("storage.dat", JSON.stringify(jsonFile));
  return true;
};

/**
 * Get some data from the database
 * @param {string} key Key to search
 * @returns The value corresponding to the key
 */

module.exports.get = (key) => {
  if (key === undefined) throw new Error("Key is undefined");
  let jsonFile = JSON.parse(file);
  return jsonFile[key];
};
