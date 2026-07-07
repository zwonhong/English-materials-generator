const { renderLinePdfTemplate } = require('./line-pdf.template');

function renderEnglishLineTemplate({ title, data, styles }) {
  return renderLinePdfTemplate({
    title,
    data,
    styles,
    documentType: 'ENGLISH LINE',
    includeKorean: false,
    worksheetClass: 'english-line-worksheet',
  });
}

module.exports = {
  renderEnglishLineTemplate,
};
