const { escapeHtml } = require('./summary-pdf.template');

function renderSentenceItems({ sentences, includeKorean }) {
  return sentences
    .map((sentence) => {
      const koreanLine = includeKorean
        ? `<p class="sentence-korean" lang="ko">${escapeHtml(sentence.korean)}</p>`
        : '';

      return `
        <li class="sentence-item">
          <span class="sentence-number">${escapeHtml(sentence.id)}.</span>
          <div class="sentence-content">
            <p class="sentence-english">${escapeHtml(sentence.english)}</p>
            ${koreanLine}
          </div>
        </li>`;
    })
    .join('\n');
}

function renderLinePdfTemplate({
  title,
  data,
  styles,
  documentType,
  includeKorean,
  worksheetClass,
}) {
  return `<!doctype html>
<html lang="${includeKorean ? 'ko' : 'en'}">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>${styles}</style>
  </head>
  <body>
    <main class="line-worksheet ${escapeHtml(worksheetClass)}">
      <header class="line-header">
        <p class="document-type">${escapeHtml(documentType)}</p>
        <h1>${escapeHtml(title)}</h1>
      </header>

      <ol class="sentence-list" aria-label="Numbered sentences">
        ${renderSentenceItems({
          sentences: data.sentences,
          includeKorean,
        })}
      </ol>
    </main>
  </body>
</html>`;
}

module.exports = {
  renderLinePdfTemplate,
  renderSentenceItems,
};
