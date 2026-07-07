const separator = '='.repeat(50);

const languageLabels = {
  en: 'English',
  ko: 'Korean',
};

function hasOwnField(change, fieldName) {
  return Object.prototype.hasOwnProperty.call(change, fieldName);
}

function renderField(label, value) {
  return `${label}\n${String(value ?? '')}`;
}

function renderOcrChange(change, index) {
  const lines = [separator, '', `[${index + 1}]`, ''];

  if (hasOwnField(change, 'language')) {
    lines.push(
      renderField('Language', languageLabels[change.language] || change.language),
      '',
    );
  }

  if (hasOwnField(change, 'type')) {
    lines.push(renderField('Type', change.type), '');
  }

  if (hasOwnField(change, 'reason')) {
    lines.push(renderField('Reason', change.reason), '');
  }

  if (hasOwnField(change, 'before')) {
    lines.push(renderField('Before', change.before), '');
  }

  if (hasOwnField(change, 'after')) {
    lines.push(renderField('After', change.after), '');
  }

  lines.push(separator);

  return lines.join('\n');
}

function renderOcrLog(ocrChanges) {
  if (!Array.isArray(ocrChanges) || ocrChanges.length === 0) {
    return 'No OCR corrections were required.\n';
  }

  return `${ocrChanges.map(renderOcrChange).join('\n\n')}\n`;
}

module.exports = {
  renderOcrChange,
  renderOcrLog,
};
