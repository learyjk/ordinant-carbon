const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "admin/case-studies-data.js");
const dataSrc = fs.readFileSync(dataPath, "utf8");
const CASE_STUDIES = eval(dataSrc.replace("window.CASE_STUDIES = ", ""));

CASE_STUDIES.forEach(function (study) {
  const htmlPath = path.join(root, "case-studies", study.post_name + ".html");
  if (!fs.existsSync(htmlPath)) {
    console.warn("Missing HTML file:", study.post_name);
    return;
  }

  let html = fs.readFileSync(htmlPath, "utf8");
  const updated = html.replace(
    /(<div class="detail-content">)[\s\S]*?(<\/div>)/,
    "$1\n        " + study.content + "\n      $2"
  );

  if (updated === html) {
    console.warn("No content block updated:", study.post_name);
    return;
  }

  fs.writeFileSync(htmlPath, updated);
  console.log("Updated:", study.post_name);
});
