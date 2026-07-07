const { renderLinePdfTemplate } = require('./line-pdf.template');

function renderEnglishKoreanLineTemplate({ title, data, styles }) {
  return renderLinePdfTemplate({
    title,
    data,
    styles,
    documentType: 'ENGLISH-KOREAN LINE',
    includeKorean: true,
    worksheetClass: 'english-korean-line-worksheet',
  });
}

module.exports = {
  renderEnglishKoreanLineTemplate,
};
