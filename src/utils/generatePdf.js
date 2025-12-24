const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");

// exports.generatePdf = async (data) => {

//     const templatePath = path.join(
//         process.cwd(),
//         "src",
//         "templates",
//         "detailsTemplate.html"
//     );

//     if (!fs.existsSync(templatePath)) {
//         throw new Error("Template file not found at: " + templatePath);
//     }

//     const templateHtml = fs.readFileSync(templatePath, "utf8");
//     const template = handlebars.compile(templateHtml);
//     const html = template(data);

//     const browser = await puppeteer.launch({
//         headless: "new",
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({
//         format: "A4",
//         printBackground: true,
//     });

//     await browser.close();
//     return pdfBuffer;
// };


exports.generatePdf = async ({ templateName, data }) => {
  if (!templateName) {
    throw new Error("templateName is required");
  }

  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    `${templateName}.html`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template file not found at: " + templatePath);
  }

  const templateHtml = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateHtml);
  const html = template(data);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
};
