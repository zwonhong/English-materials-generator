const fs = require('fs/promises');
const path = require('path');

const { renderOcrLog } = require('../templates/ocr-log.template');
const { createOcrLogFilename } = require('../utils/filename');
const geminiResponseZodSchema = require('../validators/gemini-response.schema');

const ocrLogPreviewPath = path.join(__dirname, '..', '..', 'preview_ocr_log.txt');

function validateOcrLogRequest(request, response) {
  const title = String(request.body.title ?? '').trim();

  if (!title) {
    response.status(400).json({
      success: false,
      error: 'OCR 교정 로그 제목이 없습니다. 프로젝트 제목을 입력해 주세요.',
    });
    return null;
  }

  const validation = geminiResponseZodSchema.safeParse(request.body.data);

  if (!validation.success) {
    response.status(422).json({
      success: false,
      error: 'OCR 교정 로그에 사용할 검증된 JSON이 없습니다.',
    });
    return null;
  }

  return {
    title,
    ocrChanges: validation.data.ocrChanges,
  };
}

async function downloadOcrLog(request, response) {
  const validRequest = validateOcrLogRequest(request, response);

  if (!validRequest) {
    return undefined;
  }

  try {
    const logText = renderOcrLog(validRequest.ocrChanges);
    const logBuffer = Buffer.from(logText, 'utf8');
    const filename = createOcrLogFilename(validRequest.title);

    await fs.writeFile(ocrLogPreviewPath, logText, 'utf8');

    response.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': logBuffer.length,
      'Content-Disposition': `attachment; filename="ocr-log.txt"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'X-Download-Filename': encodeURIComponent(filename),
      'Cache-Control': 'no-store',
    });

    return response.status(200).send(logBuffer);
  } catch (error) {
    console.error('[OCR log error]', error.message);

    return response.status(500).json({
      success: false,
      error: 'OCR 교정 로그를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
}

module.exports = {
  downloadOcrLog,
};
