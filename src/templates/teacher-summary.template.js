const { renderSummaryPdfTemplate } = require('./summary-pdf.template');

function renderTeacherSummaryTemplate({ title, data, styles }) {
  return renderSummaryPdfTemplate({
    title,
    data,
    styles,
    documentType: 'TEACHER SUMMARY',
    includeKorean: true,
  });
}

module.exports = {
  renderTeacherSummaryTemplate,
};
