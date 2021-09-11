/** @format */
const { jsPDF } = require("jspdf");
const { Buffer } = require("buffer");
const exe = require("../tools/saveFile").execute;

module.exports = {
  event: "makePDF",
  channel: "main",
  async execute(event, data) {
    // Destructure data
    const { questions, type } = data;

    /**
     * --------------------
     * Timestamp Logic
     * --------------------
     */
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

    /**
     * --------------------
     * First page
     * --------------------
     */
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

    /**
     * --------------------
     * Answers page
     * --------------------
     */
    doc.addPage();
    doc.text("Answer Key", 1, 1);
    let x = 0;
    let fromTop = 3;
    for (let i = 0; i < questions.length; i++) {
      if (x % 5 == 0) {
        fromTop += 2;
        x = 0;
      }
      const element = questions[i];

      doc.text(`A${i + 1}. ${element.answer}`, x * 4 + 1, fromTop);
      x++;
    }

    /**
     * --------------------
     * Save file
     * --------------------
     */
    const buffer = Buffer.from(doc.output("arraybuffer"));
    exe("buffer", { type: "buffer", payload: buffer });
  },
};
