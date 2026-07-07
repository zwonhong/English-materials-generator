const path = require('path');
const { pathToFileURL } = require('url');

const regularFontPath = path.resolve(
  __dirname,
  '..',
  '..',
  'assets',
  'fonts',
  'HCRDotum.ttf',
);

const boldFontPath = path.resolve(
  __dirname,
  '..',
  '..',
  'assets',
  'fonts',
  'HCRDotum-Bold.ttf',
);

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

module.exports = {
  applyPdfFonts,
  createFontFaceCss,
};
