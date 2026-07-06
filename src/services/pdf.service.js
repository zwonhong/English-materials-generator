const puppeteer = require('puppeteer');

const millimetersToPixels = (millimeters) => (millimeters * 96) / 25.4;

async function fitSummaryToPage(page) {
  const printableHeight = millimetersToPixels(297 - 40);

  await page.evaluate((maximumHeight) => {
    const root = document.documentElement;
    const worksheet = document.querySelector('.worksheet');

    if (worksheet.scrollHeight > maximumHeight) {
      root.classList.add('compact');
    }

    if (worksheet.scrollHeight > maximumHeight) {
      root.classList.add('extra-compact');
    }
  }, printableHeight);
}

async function generatePdfBuffer(html) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMediaType('print');
    await page.evaluate(() => document.fonts.ready);
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
  }
}

module.exports = {
  fitSummaryToPage,
  generatePdfBuffer,
};
