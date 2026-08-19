const fs = require("fs");
const path = require("path");

const SITE_URL = "https://ordinant-carbon.com";
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "admin/case-studies-data.js");
const dataSrc = fs.readFileSync(dataPath, "utf8");
const CASE_STUDIES = eval(dataSrc.replace("window.CASE_STUDIES = ", ""));

function toLastmod(value) {
  if (!value || value.indexOf("0000-00-00") === 0) return null;
  var parts = String(value).trim().split(/\s+/)[0].split("-");
  if (parts.length !== 3) return null;
  return parts[0] + "-" + parts[1] + "-" + parts[2];
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  var lines = ["  <url>", "    <loc>" + xmlEscape(loc) + "</loc>"];
  if (lastmod) lines.push("    <lastmod>" + lastmod + "</lastmod>");
  if (changefreq) lines.push("    <changefreq>" + changefreq + "</changefreq>");
  if (priority) lines.push("    <priority>" + priority + "</priority>");
  lines.push("  </url>");
  return lines.join("\n");
}

var staticPages = [
  { path: "/", lastmod: "2023-06-01", changefreq: "monthly", priority: "1.0" },
  { path: "/platform.html", lastmod: "2022-11-15", changefreq: "monthly", priority: "0.8" },
  { path: "/about.html", lastmod: "2023-01-10", changefreq: "monthly", priority: "0.8" },
  { path: "/case-studies.html", lastmod: "2023-03-01", changefreq: "weekly", priority: "0.9" }
];

var publishedStudies = CASE_STUDIES.filter(function (row) {
  return row.post_status === "publish";
});

var entries = staticPages.map(function (page) {
  return urlEntry(SITE_URL + page.path, page.lastmod, page.changefreq, page.priority);
});

publishedStudies.forEach(function (row) {
  entries.push(
    urlEntry(
      SITE_URL + "/case-studies/" + row.post_name + ".html",
      toLastmod(row.post_modified || row.post_date),
      "monthly",
      "0.7"
    )
  );
});

var draftCount = CASE_STUDIES.length - publishedStudies.length;
var sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.join("\n") +
  "\n</urlset>\n";

var robots =
  "User-agent: *\n" +
  "Disallow: /admin/\n" +
  "\n" +
  "Sitemap: " + SITE_URL + "/sitemap.xml\n";

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "robots.txt"), robots);

console.log("Wrote sitemap.xml (" + entries.length + " URLs, " + draftCount + " draft case studies excluded)");
console.log("Wrote robots.txt");
