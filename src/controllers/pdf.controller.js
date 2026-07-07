const fs = require('fs/promises');
const path = require('path');

const pdfService = require('../services/pdf.service');
const {
  renderEnglishKoreanLineTemplate,
} = require('../templates/english-korean-line.template');
const {
  renderEnglishLineTemplate,
} = require('../templates/english-line.template');
const {
  renderStudentSummaryTemplate,
} = require('../templates/student-summary.template');
const {
  renderTeacherSummaryTemplate,
} = require('../templates/teacher-summary.template');
const {
  createEnglishKoreanLineFilename,
  createEnglishLineFilename,
  createStudentSummaryFilename,
  createTeacherSummaryFilename,
} = require('../utils/filename');
const geminiResponseZodSchema = require('../validators/gemini-response.schema');

const summaryCssPath = path.join(
  __dirname,
  '..',
  'templates',
  'student-summary.css',
);
const linePdfCssPath = path.join(__dirname, '..', 'templates', 'line-pdf.css');
const englishLinePreviewPath = path.join(
  __dirname,
  '..',
  '..',
  'preview_english_line.pdf',
);
const englishKoreanLinePreviewPath = path.join(
  __dirname,
  '..',
  '..',
  'preview_english_korean_line.pdf',
);

function validatePdfRequest(request, response, koreanName) {
  const title = String(request.body.title ?? '').trim();

  if (!title) {
    response.status(400).json({
      success: false,
      error: `${koreanName} PDF 제목이 없습니다. 프로젝트 제목을 입력해 주세요.`,
    });
    return null;
  }

  const validation = geminiResponseZodSchema.safeParse(request.body.data);

  if (!validation.success) {
    response.status(422).json({
      success: false,
      error: `${koreanName} PDF에 사용할 검증된 JSON이 없습니다.`,
    });
    return null;
  }

  return {
    title,
    data: validation.data,
  };
}

function sendPdfDownload(response, pdfBuffer, filename, asciiFilename) {
  response.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdfBuffer.length,
    'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'X-Download-Filename': encodeURIComponent(filename),
    'Cache-Control': 'no-store',
  });

  return response.status(200).send(pdfBuffer);
}

async function downloadSummaryPdf(request, response, options) {
  const validRequest = validatePdfRequest(
    request,
    response,
    `${options.koreanName} 요약`,
  );

  if (!validRequest) {
    return undefined;
  }

  try {
    const styles = await fs.readFile(summaryCssPath, 'utf8');
    const html = options.renderTemplate({
      title: validRequest.title,
      data: validRequest.data,
      styles,
    });
    const pdfBuffer = await pdfService.generatePdfBuffer(html);
    const filename = options.createFilename(validRequest.title);

    return sendPdfDownload(
      response,
      pdfBuffer,
      filename,
      options.asciiFilename,
    );
  } catch (error) {
    console.error(`[${options.logName} PDF error]`, error.message);

    return response.status(500).json({
      success: false,
      error: `${options.koreanName} 요약 PDF를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
    });
  }
}

async function downloadLinePdf(request, response, options) {
  const validRequest = validatePdfRequest(request, response, options.koreanName);

  if (!validRequest) {
    return undefined;
  }

  try {
    const styles = await fs.readFile(linePdfCssPath, 'utf8');
    const html = options.renderTemplate({
      title: validRequest.title,
      data: validRequest.data,
      styles,
    });
    const pdfBuffer = await pdfService.generatePdfBuffer(html);
    const filename = options.createFilename(validRequest.title);

    await fs.writeFile(options.previewPath, pdfBuffer);

    return sendPdfDownload(
      response,
      pdfBuffer,
      filename,
      options.asciiFilename,
    );
  } catch (error) {
    console.error(`[${options.logName} PDF error]`, error.message);

    return response.status(500).json({
      success: false,
      error: `${options.koreanName} PDF를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.`,
    });
  }
}

function downloadStudentSummary(request, response) {
  return downloadSummaryPdf(request, response, {
    koreanName: '학생용',
    logName: 'Student summary',
    asciiFilename: 'student-summary.pdf',
    renderTemplate: renderStudentSummaryTemplate,
    createFilename: createStudentSummaryFilename,
  });
}

function downloadTeacherSummary(request, response) {
  return downloadSummaryPdf(request, response, {
    koreanName: '선생님용',
    logName: 'Teacher summary',
    asciiFilename: 'teacher-summary.pdf',
    renderTemplate: renderTeacherSummaryTemplate,
    createFilename: createTeacherSummaryFilename,
  });
}

function downloadEnglishLine(request, response) {
  return downloadLinePdf(request, response, {
    koreanName: '영어 한줄',
    logName: 'English line',
    asciiFilename: 'english-line.pdf',
    renderTemplate: renderEnglishLineTemplate,
    createFilename: createEnglishLineFilename,
    previewPath: englishLinePreviewPath,
  });
}

function downloadEnglishKoreanLine(request, response) {
  return downloadLinePdf(request, response, {
    koreanName: '영한 한줄',
    logName: 'English-Korean line',
    asciiFilename: 'english-korean-line.pdf',
    renderTemplate: renderEnglishKoreanLineTemplate,
    createFilename: createEnglishKoreanLineFilename,
    previewPath: englishKoreanLinePreviewPath,
  });
}

module.exports = {
  downloadEnglishKoreanLine,
  downloadEnglishLine,
  downloadStudentSummary,
  downloadTeacherSummary,
};
