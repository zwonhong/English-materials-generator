function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderTextSection({ heading, content, korean, includeKorean }) {
  if (!includeKorean) {
    return `
      <section class="content-section">
        <h2>${escapeHtml(heading)}</h2>
        <p>${escapeHtml(content)}</p>
      </section>`;
  }

  return `
      <section class="content-section">
        <h2>${escapeHtml(heading)}</h2>
        <div class="language-block">
          <p class="language-label">ENGLISH</p>
          <p>${escapeHtml(content)}</p>
        </div>
        <div class="language-block korean-block" lang="ko">
          <p class="language-label">KOREAN</p>
          <p class="korean-text">${escapeHtml(korean)}</p>
        </div>
      </section>`;
}

function renderKeyPoints(keyPoints, includeKorean) {
  return keyPoints
    .map((point) => {
      if (!includeKorean) {
        return `<li>${escapeHtml(point.en)}</li>`;
      }

      return `
        <li>
          <p>${escapeHtml(point.en)}</p>
          <p class="korean-text key-point-korean" lang="ko">${escapeHtml(point.ko)}</p>
        </li>`;
    })
    .join('');
}

function renderSummaryPdfTemplate({
  title,
  data,
  styles,
  documentType,
  includeKorean,
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>${styles}</style>
  </head>
  <body>
    <main class="worksheet ${includeKorean ? 'teacher-version' : 'student-version'}">
      <header class="document-header">
        <p class="document-type">${escapeHtml(documentType)}</p>
        <h1>${escapeHtml(title)}</h1>
      </header>

      <section class="content-section passage-section">
        <h2>Original Passage</h2>
        <p class="passage">${escapeHtml(data.correctedText)}</p>
      </section>

      ${renderTextSection({
        heading: 'Summary',
        content: data.summary.en,
        korean: data.summary.ko,
        includeKorean,
      })}

      ${renderTextSection({
        heading: 'Main Idea',
        content: data.mainIdea.en,
        korean: data.mainIdea.ko,
        includeKorean,
      })}

      <section class="content-section">
        <h2>Key Points</h2>
        <ul class="key-points">${renderKeyPoints(data.keyPoints, includeKorean)}</ul>
      </section>
    </main>
  </body>
</html>`;
}

module.exports = {
  escapeHtml,
  renderSummaryPdfTemplate,
};
