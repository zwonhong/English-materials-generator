const {
  escapeHtml,
  renderSummaryPdfTemplate,
} = require('./summary-pdf.template');

function renderStudentSummaryTemplate({ title, data, styles }) {
  return renderSummaryPdfTemplate({
    title,
    data,
    styles,
    documentType: 'STUDENT SUMMARY',
    includeKorean: false,
  });
}

module.exports = {
  escapeHtml,
  renderStudentSummaryTemplate,
};
