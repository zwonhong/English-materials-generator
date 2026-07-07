const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const fontDirectory = path.resolve(
  __dirname,
  '..',
  '..',
  'assets',
  'fonts',
);

const regularFontFilename = 'HCRDotum.ttf';
const boldFontFilename = 'HCRDotum-Bold.ttf';

function getActualFontFilenames() {
  return fs.existsSync(fontDirectory) ? fs.readdirSync(fontDirectory) : [];
}

function findFontFile(filename) {
  const actualFontFilenames = getActualFontFilenames();
  return actualFontFilenames.includes(filename)
    ? path.resolve(fontDirectory, filename)
    : path.resolve(fontDirectory, filename);
}

const regularFontPath = findFontFile(regularFontFilename);
const boldFontPath = findFontFile(boldFontFilename);

function createFontFaceCss() {
  const regularFontUrl = pathToFileURL(regularFontPath).href;
  const boldFontUrl = pathToFileURL(boldFontPath).href;

  return `
@font-face {
  font-family: "HCRDotum";
  src: url("${regularFontUrl}") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: block;
}

@font-face {
  font-family: "HCRDotum";
  src: url("${boldFontUrl}") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: block;
}
`;
}

function applyPdfFonts(styles) {
  return `${createFontFaceCss()}\n${styles}`;
}

function getPdfFontDebugInfo() {
  return {
    fontDirectory,
    actualFontFilenames: getActualFontFilenames(),
    regularFontFilename,
    regularFontPath,
    regularFontExists: fs.existsSync(regularFontPath),
    boldFontFilename,
    boldFontPath,
    boldFontExists: fs.existsSync(boldFontPath),
    regularFontUrl: pathToFileURL(regularFontPath).href,
    boldFontUrl: pathToFileURL(boldFontPath).href,
  };
}

function logPdfFontDebugInfo(context = 'PDF') {
  const fontInfo = getPdfFontDebugInfo();

  console.info(
    `[${context} font debug] Actual font files: ${fontInfo.actualFontFilenames.join(', ') || '(none)'}`,
  );
  console.info(`[${context} font debug] Regular font path: ${fontInfo.regularFontPath}`);
  console.info(`[${context} font debug] Regular font exists: ${fontInfo.regularFontExists}`);
  console.info(`[${context} font debug] Bold font path: ${fontInfo.boldFontPath}`);
  console.info(`[${context} font debug] Bold font exists: ${fontInfo.boldFontExists}`);

  if (!fontInfo.regularFontExists || !fontInfo.boldFontExists) {
    console.warn(
      `[${context} font warning] PDF font files are missing. Korean text may render as broken squares.`,
    );
  }
}

module.exports = {
  applyPdfFonts,
  createFontFaceCss,
  getPdfFontDebugInfo,
  logPdfFontDebugInfo,
};
