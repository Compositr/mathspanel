/** @format */

const $ = require("jquery");

/**
 * Fill in version areas
 */
const { version } = require("../package.json");
console.log(`Running mathsgen version ${version}`);
$("span.version").text(version);

/**
 * Collapsible
 */
let coll = document.getElementsByClassName("collapseButton");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}
