const projectForm = document.querySelector('#projectForm');
const titleInput = document.querySelector('#title');
const englishOcrTextarea = document.querySelector('#englishOcr');
const hasTranslationCheckbox = document.querySelector('#hasTranslation');
const koreanOcrTextarea = document.querySelector('#koreanOcr');
const generateButton = document.querySelector('#generateButton');
const resetButton = document.querySelector('#resetButton');
const generationStatus = document.querySelector('#generationStatus');
const resultSection = document.querySelector('#resultSection');
const resultArea = document.querySelector('#resultArea');
const studentSummaryButton = document.querySelector('#studentSummaryButton');
const teacherSummaryButton = document.querySelector('#teacherSummaryButton');
const downloadStatus = document.querySelector('#downloadStatus');

const quotaWarning =
  '무료 Gemini API 한도가 모두 소진되었습니다.\n잠시 후 다시 시도하거나 API Key를 변경해 주세요.';

const projectState = {
  generatedJson: null,
  projectTitle: '',
  generationCompleted: false,
  quotaExhausted: false,
  generating: false,
};

function syncKoreanOcrState() {
  koreanOcrTextarea.disabled = !hasTranslationCheckbox.checked;
  koreanOcrTextarea.required = hasTranslationCheckbox.checked;
}

function syncGenerateButtonState() {
  generateButton.disabled =
    projectState.generating ||
    projectState.generationCompleted ||
    projectState.quotaExhausted;
  resetButton.disabled = projectState.generating;
}

function showStatus(message, type = '') {
  generationStatus.className = 'generation-status';
  if (type) {
    generationStatus.classList.add(type);
  }
  generationStatus.textContent = message;
}

function isQuotaResponse(response, result) {
  return (
    response.status === 429 ||
    result.code === 'GEMINI_QUOTA_EXHAUSTED' ||
    /RESOURCE_EXHAUSTED|quota\s*(?:has been\s*)?exceeded|HTTP\s*429|\b429\b/i.test(
      String(result.error ?? ''),
    )
  );
}

hasTranslationCheckbox.addEventListener('change', syncKoreanOcrState);

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (
    projectState.generating ||
    projectState.generationCompleted ||
    projectState.quotaExhausted
  ) {
    return;
  }

  projectState.generating = true;
  syncGenerateButtonState();
  showStatus('Gemini가 학습 자료를 생성하고 있습니다...');

  const requestBody = {
    title: titleInput.value,
    hasTranslation: hasTranslationCheckbox.checked,
    englishOCR: englishOcrTextarea.value,
  };

  if (hasTranslationCheckbox.checked) {
    requestBody.koreanOCR = koreanOcrTextarea.value;
  }

  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const result = await response.json();

    if (isQuotaResponse(response, result)) {
      projectState.quotaExhausted = true;
      showStatus(quotaWarning, 'warning');
      return;
    }

    if (!response.ok) {
      const validationDetails = result.validationErrors
        ?.map((issue) => `${issue.path}: ${issue.message}`)
        .join('\n');
      throw new Error(
        validationDetails
          ? `${result.error}\n${validationDetails}`
          : result.error || 'Gemini 응답을 처리할 수 없습니다.',
      );
    }

    projectState.generatedJson = result.data;
    projectState.projectTitle = titleInput.value.trim();
    projectState.generationCompleted = true;
    resultArea.textContent = '생성이 완료되었습니다. 결과 JSON이 브라우저 메모리에 준비되었습니다.';
    resultSection.hidden = false;
    studentSummaryButton.disabled = false;
    teacherSummaryButton.disabled = false;
    showStatus('생성이 성공적으로 완료되었습니다.', 'success');
  } catch (error) {
    showStatus(error.message, 'error');
  } finally {
    projectState.generating = false;
    syncGenerateButtonState();
  }
});

async function downloadSummaryPdf({ button, endpoint, label, fallbackSuffix }) {
  if (!projectState.generatedJson || !projectState.generationCompleted) {
    downloadStatus.className = 'download-status error';
    downloadStatus.textContent = '먼저 학습 자료 생성을 완료해 주세요.';
    button.disabled = true;
    return;
  }

  button.disabled = true;
  downloadStatus.className = 'download-status';
  downloadStatus.textContent = `${label} PDF를 생성하고 있습니다...`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: projectState.projectTitle,
        data: projectState.generatedJson,
      }),
    });

    if (!response.ok) {
      const errorResult = await response.json().catch(() => null);
      throw new Error(
        errorResult?.error || `${label} PDF를 생성하지 못했습니다.`,
      );
    }

    const pdfBlob = await response.blob();
    const encodedFilename = response.headers.get('X-Download-Filename');
    const filename = encodedFilename
      ? decodeURIComponent(encodedFilename)
      : `${projectState.projectTitle}_${fallbackSuffix}.pdf`;
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    downloadStatus.className = 'download-status success';
    downloadStatus.textContent = `${label} PDF 다운로드를 시작했습니다.`;
  } catch (error) {
    downloadStatus.className = 'download-status error';
    downloadStatus.textContent = error.message;
  } finally {
    button.disabled = !projectState.generatedJson;
  }
}

studentSummaryButton.addEventListener('click', () => {
  downloadSummaryPdf({
    button: studentSummaryButton,
    endpoint: '/api/pdf/student-summary',
    label: '학생용 요약',
    fallbackSuffix: '요약본(학생)',
  });
});

teacherSummaryButton.addEventListener('click', () => {
  downloadSummaryPdf({
    button: teacherSummaryButton,
    endpoint: '/api/pdf/teacher-summary',
    label: '교사용 요약',
    fallbackSuffix: '요약본(선생님)',
  });
});

resetButton.addEventListener('click', () => {
  projectForm.reset();
  projectState.generatedJson = null;
  projectState.projectTitle = '';
  projectState.generationCompleted = false;
  resultArea.replaceChildren();
  resultSection.hidden = true;
  studentSummaryButton.disabled = true;
  teacherSummaryButton.disabled = true;
  downloadStatus.className = 'download-status';
  downloadStatus.textContent = '';
  syncKoreanOcrState();

  if (projectState.quotaExhausted) {
    showStatus(quotaWarning, 'warning');
  } else {
    showStatus('');
  }

  syncGenerateButtonState();
  titleInput.focus();
});

syncKoreanOcrState();
syncGenerateButtonState();
