const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const puppeteer = require('puppeteer');

const millimetersToPixels = (millimeters) => (millimeters * 96) / 25.4;

async function fitSummaryToPage(page) {
  const printableHeight = millimetersToPixels(297 - 40);

  await page.evaluate((maximumHeight) => {
    const root = document.documentElement;
    const worksheet =
      document.querySelector('.worksheet') ||
      document.querySelector('.line-worksheet');

    if (worksheet && worksheet.scrollHeight > maximumHeight) {
      root.classList.add('compact');
    }

    if (worksheet && worksheet.scrollHeight > maximumHeight) {
      root.classList.add('extra-compact');
    }
  }, printableHeight);
}

async function generatePdfBuffer(html) {
  let browser;
  let temporaryHtmlPath;

  try {
    temporaryHtmlPath = path.join(
      os.tmpdir(),
      `teacher-auto-pdf-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.html`,
    );
    await fs.writeFile(temporaryHtmlPath, html, 'utf8');

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-file-access-from-files',
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(temporaryHtmlPath).href, {
      waitUntil: ['load', 'networkidle0'],
    });
    await page.emulateMediaType('print');
    const fontStatus = await page.evaluate(async () => {
      await document.fonts.ready;

      return Array.from(document.fonts).map((fontFace) => ({
        family: fontFace.family,
        weight: fontFace.weight,
        status: fontFace.status,
      }));
    });
    console.info('[PDF font debug] Browser font status:', fontStatus);
    await fitSummaryToPage(page);

    const pdf = await page.pdf({
      format: 'A4',
      landscape: false,
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) {
      await browser.close();
    }

    if (temporaryHtmlPath) {
      await fs.unlink(temporaryHtmlPath).catch(() => undefined);
    }
  }
}

module.exports = {
  fitSummaryToPage,
  generatePdfBuffer,
};
