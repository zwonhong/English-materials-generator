const projectForm = document.querySelector('#projectForm');
const titleInput = document.querySelector('#title');
const englishOcrTextarea = document.querySelector('#englishOcr');
const hasTranslationCheckbox = document.querySelector('#hasTranslation');
const koreanOcrTextarea = document.querySelector('#koreanOcr');
const generateButton = document.querySelector('#generateButton');
const generateSpinner = document.querySelector('#generateSpinner');
const generateButtonText = document.querySelector('#generateButtonText');
const resetButton = document.querySelector('#resetButton');
const messageArea = document.querySelector('#messageArea');
const messageText = document.querySelector('#messageText');
const resultSection = document.querySelector('#resultSection');
const studentSummaryButton = document.querySelector('#studentSummaryButton');
const teacherSummaryButton = document.querySelector('#teacherSummaryButton');
const englishLineButton = document.querySelector('#englishLineButton');
const englishKoreanLineButton = document.querySelector(
  '#englishKoreanLineButton',
);
const ocrLogButton = document.querySelector('#ocrLogButton');
const copyJsonButton = document.querySelector('#copyJsonButton');

const messages = {
  success: 'Generation completed successfully.',
  validationError: 'Invalid response received from Gemini.',
  quotaError:
    '무료 Gemini API 한도가 모두 소진되었습니다.\n\n잠시 후 다시 시도하거나 API Key를 변경해 주세요.',
  unexpectedError: 'An unexpected error occurred.',
  clipboardSuccess: 'JSON copied to clipboard.',
  resetConfirm:
    '현재 프로젝트의 생성 결과가 모두 삭제됩니다.\n\n계속하시겠습니까?',
  alreadyGenerated:
    'Generation completed successfully. 새로 생성하려면 New Project / Reset을 눌러 주세요.',
};

const projectState = {
  generatedJson: null,
  projectTitle: '',
  generationCompleted: false,
  quotaExhausted: false,
  generating: false,
};

const outputButtons = [
  studentSummaryButton,
  teacherSummaryButton,
  englishLineButton,
  englishKoreanLineButton,
  ocrLogButton,
  copyJsonButton,
];

function hasValidatedJson() {
  return Boolean(projectState.generatedJson) && projectState.generationCompleted;
}

function syncKoreanOcrState() {
  koreanOcrTextarea.disabled = !hasTranslationCheckbox.checked;
  koreanOcrTextarea.required = hasTranslationCheckbox.checked;

  if (!hasTranslationCheckbox.checked) {
    koreanOcrTextarea.value = '';
  }
}

function syncGenerateButtonState() {
  generateButton.disabled = projectState.generating || projectState.quotaExhausted;
  generateButton.classList.toggle('is-loading', projectState.generating);
  generateSpinner.hidden = !projectState.generating;
  generateButtonText.textContent = projectState.generating
    ? 'Generating...'
    : 'Generate';
  resetButton.disabled = projectState.generating;
}

function syncDownloadButtonsState() {
  const enabled = hasValidatedJson();

  outputButtons.forEach((button) => {
    button.disabled = !enabled;
  });

  resultSection.hidden = !enabled;
}

function showMessage(type, message) {
  messageArea.hidden = false;
  messageArea.className = `message-area ${type}`;
  messageText.textContent = message;
}

function hideMessage() {
  messageArea.hidden = true;
  messageArea.className = 'message-area';
  messageText.textContent = '';
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

function getValidationDetails(result) {
  return result.validationErrors
    ?.map((issue) => `${issue.path}: ${issue.message}`)
    .join('\n');
}

function clearBrowserMemoryState() {
  projectState.generatedJson = null;
  projectState.projectTitle = '';
  projectState.generationCompleted = false;
  projectState.quotaExhausted = false;
  projectState.generating = false;
}

function resetFormToInitialState() {
  projectForm.reset();
  clearBrowserMemoryState();
  syncKoreanOcrState();
  syncGenerateButtonState();
  syncDownloadButtonsState();
  hideMessage();
  titleInput.focus();
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

hasTranslationCheckbox.addEventListener('change', syncKoreanOcrState);

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (projectState.generating) {
    return;
  }

  if (projectState.generationCompleted) {
    showMessage('success', messages.alreadyGenerated);
    return;
  }

  projectState.generating = true;
  hideMessage();
  syncGenerateButtonState();

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
      showMessage('warning', messages.quotaError);
      return;
    }

    if (!response.ok) {
      const validationDetails = getValidationDetails(result);
      const isValidationError =
        response.status === 422 || Boolean(result.validationErrors);

      showMessage(
        isValidationError ? 'error' : 'error',
        isValidationError
          ? `${messages.validationError}${validationDetails ? `\n\n${validationDetails}` : ''}`
          : result.error || messages.unexpectedError,
      );
      return;
    }

    projectState.generatedJson = result.data;
    projectState.projectTitle = titleInput.value.trim();
    projectState.generationCompleted = true;
    syncDownloadButtonsState();
    showMessage('success', messages.success);
  } catch (error) {
    console.error('[Main UI unexpected error]', error);
    showMessage('error', messages.unexpectedError);
  } finally {
    projectState.generating = false;
    syncGenerateButtonState();
  }
});

async function downloadOutput({
  button,
  endpoint,
  label,
  fallbackSuffix,
  fallbackExtension,
}) {
  if (!hasValidatedJson()) {
    showMessage('error', '먼저 학습 자료 생성을 완료해 주세요.');
    button.disabled = true;
    return;
  }

  button.disabled = true;
  showMessage('info', `${label} 파일을 생성하고 있습니다...`);

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
        errorResult?.error || `${label} 파일을 생성하지 못했습니다.`,
      );
    }

    const outputBlob = await response.blob();
    const encodedFilename = response.headers.get('X-Download-Filename');
    const filename = encodedFilename
      ? decodeURIComponent(encodedFilename)
      : `${projectState.projectTitle}_${fallbackSuffix}.${fallbackExtension}`;
    const downloadUrl = URL.createObjectURL(outputBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    showMessage('success', `${label} 다운로드를 시작했습니다.`);
  } catch (error) {
    console.error('[Download error]', error);
    showMessage('error', messages.unexpectedError);
  } finally {
    syncDownloadButtonsState();
  }
}

studentSummaryButton.addEventListener('click', () => {
  downloadOutput({
    button: studentSummaryButton,
    endpoint: '/api/pdf/student-summary',
    label: '학생용 요약 PDF',
    fallbackSuffix: '요약본(학생)',
    fallbackExtension: 'pdf',
  });
});

teacherSummaryButton.addEventListener('click', () => {
  downloadOutput({
    button: teacherSummaryButton,
    endpoint: '/api/pdf/teacher-summary',
    label: '선생님용 요약 PDF',
    fallbackSuffix: '요약본(선생님)',
    fallbackExtension: 'pdf',
  });
});

englishLineButton.addEventListener('click', () => {
  downloadOutput({
    button: englishLineButton,
    endpoint: '/api/pdf/english-line',
    label: '영어 한줄 PDF',
    fallbackSuffix: '영어한줄',
    fallbackExtension: 'pdf',
  });
});

englishKoreanLineButton.addEventListener('click', () => {
  downloadOutput({
    button: englishKoreanLineButton,
    endpoint: '/api/pdf/english-korean-line',
    label: '영한 한줄 PDF',
    fallbackSuffix: '영한한줄',
    fallbackExtension: 'pdf',
  });
});

ocrLogButton.addEventListener('click', () => {
  downloadOutput({
    button: ocrLogButton,
    endpoint: '/api/ocr-log',
    label: 'OCR 교정 로그',
    fallbackSuffix: 'OCR교정로그',
    fallbackExtension: 'txt',
  });
});

copyJsonButton.addEventListener('click', async () => {
  if (!hasValidatedJson()) {
    showMessage('error', '먼저 학습 자료 생성을 완료해 주세요.');
    return;
  }

  try {
    await copyTextToClipboard(JSON.stringify(projectState.generatedJson, null, 2));
    showMessage('success', messages.clipboardSuccess);
  } catch (error) {
    console.error('[Clipboard error]', error);
    showMessage('error', messages.unexpectedError);
  }
});

resetButton.addEventListener('click', () => {
  const confirmed = window.confirm(messages.resetConfirm);

  if (!confirmed) {
    return;
  }

  resetFormToInitialState();
});

generateSpinner.hidden = true;
syncKoreanOcrState();
syncGenerateButtonState();
syncDownloadButtonsState();
