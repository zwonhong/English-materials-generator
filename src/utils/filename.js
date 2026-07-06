function sanitizeFilenamePart(value) {
  const sanitized = String(value ?? '')
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 100);

  return sanitized || 'English_Helper';
}

function createStudentSummaryFilename(title) {
  return `${sanitizeFilenamePart(title)}_요약본(학생).pdf`;
}

function createTeacherSummaryFilename(title) {
  return `${sanitizeFilenamePart(title)}_요약본(선생님).pdf`;
}

module.exports = {
  createStudentSummaryFilename,
  createTeacherSummaryFilename,
  sanitizeFilenamePart,
};
