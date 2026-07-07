const geminiService = require('../services/gemini.service');
const geminiResponseZodSchema = require('../validators/gemini-response.schema');

const quotaWarning =
  '무료 Gemini API 한도가 모두 소진되었습니다.\n잠시 후 다시 시도하거나 API Key를 변경해 주세요.';

function isQuotaError(error) {
  const status = error?.status ?? error?.code;
  const message = String(error?.message ?? '');

  return (
    status === 429 ||
    status === '429' ||
    /RESOURCE_EXHAUSTED|quota\s*(?:has been\s*)?exceeded|HTTP\s*429|\b429\b/i.test(
      message,
    )
  );
}

function formatValidationIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

async function generateProjectJson(request, response) {
  const title = String(request.body.title ?? '').trim();
  const englishOCR = String(request.body.englishOCR ?? '').trim();
  const hasTranslation = request.body.hasTranslation === true;
  const koreanOCR = hasTranslation
    ? String(request.body.koreanOCR ?? '').trim()
    : '';

  if (!title || !englishOCR) {
    return response.status(400).json({
      success: false,
      error: '제목과 영어 OCR을 입력해 주세요.',
    });
  }

  if (hasTranslation && !koreanOCR) {
    return response.status(400).json({
      success: false,
      error: '기존 한국어 번역을 선택한 경우 한국어 OCR을 입력해 주세요.',
    });
  }

  try {
    const result = await geminiService.generateStructuredProjectData({
      title,
      hasTranslation,
      englishOCR,
      koreanOCR,
    });

    const validation = geminiResponseZodSchema.safeParse(result.data);

    if (!validation.success) {
      return response.status(422).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'Gemini 응답이 필수 JSON 형식과 일치하지 않습니다.',
        validationErrors: formatValidationIssues(validation.error.issues),
        rawResponse: result.rawText,
      });
    }

    console.log('[Gemini structured output]', result.rawText);

    return response.status(200).json({
      success: true,
      model: result.model,
      rawResponse: result.rawText,
      data: validation.data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Gemini 구조화 JSON 생성 중 알 수 없는 오류가 발생했습니다.';

    console.error('[Gemini structured output error]', message);

    if (isQuotaError(error)) {
      return response.status(429).json({
        success: false,
        code: 'GEMINI_QUOTA_EXHAUSTED',
        error: quotaWarning,
        rawResponse: error.rawResponse || message,
      });
    }

    return response.status(502).json({
      success: false,
      code: 'GEMINI_REQUEST_FAILED',
      error: message,
      rawResponse: error.rawResponse || null,
    });
  }
}

module.exports = {
  generateProjectJson,
  isQuotaError,
};
