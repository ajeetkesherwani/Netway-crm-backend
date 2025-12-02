const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");

exports.generatePdf = async (data) => {
    const templatePath = path.join(__dirname, "../templates/detailsTemplate.html");
    const templateHtml = fs.readFileSync(templatePath, "utf8");

    const template = handlebars.compile(templateHtml);
    const html = template(data);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
};
