const debugForm = document.querySelector('#debugForm');
const testButton = document.querySelector('#testButton');
const hasTranslationCheckbox = document.querySelector('#hasTranslation');
const koreanOcrTextarea = document.querySelector('#koreanOCR');
const statusMessage = document.querySelector('#statusMessage');
const responseOutput = document.querySelector('#responseOutput');

function syncKoreanOcrState() {
  koreanOcrTextarea.disabled = !hasTranslationCheckbox.checked;
  koreanOcrTextarea.required = hasTranslationCheckbox.checked;
}

hasTranslationCheckbox.addEventListener('change', syncKoreanOcrState);

debugForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  testButton.disabled = true;
  statusMessage.classList.remove('error');
  statusMessage.textContent = 'Gemini 구조화 JSON을 생성하는 중입니다...';
  responseOutput.textContent = '';

  const requestBody = {
    title: debugForm.elements.title.value,
    hasTranslation: hasTranslationCheckbox.checked,
    englishOCR: debugForm.elements.englishOCR.value,
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

    if (result.data) {
      responseOutput.textContent = JSON.stringify(result.data, null, 2);
    } else if (result.rawResponse) {
      responseOutput.textContent = result.rawResponse;
    } else {
      responseOutput.textContent = JSON.stringify(result, null, 2);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Gemini 구조화 JSON 생성에 실패했습니다.');
    }

    statusMessage.textContent = '구조화 JSON 생성에 성공했습니다.';
  } catch (error) {
    statusMessage.classList.add('error');
    statusMessage.textContent = error.message;
  } finally {
    testButton.disabled = false;
  }
});

syncKoreanOcrState();
