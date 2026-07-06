const fs = require('fs/promises');
const path = require('path');

const pdfService = require('../services/pdf.service');
const {
  renderStudentSummaryTemplate,
} = require('../templates/student-summary.template');
const {
  renderTeacherSummaryTemplate,
} = require('../templates/teacher-summary.template');
const {
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

async function downloadSummaryPdf(request, response, options) {
  const title = String(request.body.title ?? '').trim();

  if (!title) {
    return response.status(400).json({
      success: false,
      error: 'PDF 제목이 없습니다. 새 프로젝트에서 제목을 입력해 주세요.',
    });
  }

  const validation = geminiResponseZodSchema.safeParse(request.body.data);

  if (!validation.success) {
    return response.status(422).json({
      success: false,
      error: `${options.koreanName} PDF에 사용할 검증된 JSON이 없습니다.`,
    });
  }

  try {
    const styles = await fs.readFile(summaryCssPath, 'utf8');
    const html = options.renderTemplate({
      title,
      data: validation.data,
      styles,
    });
    const pdfBuffer = await pdfService.generatePdfBuffer(html);
    const filename = options.createFilename(title);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${options.asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'X-Download-Filename': encodeURIComponent(filename),
      'Cache-Control': 'no-store',
    });

    return response.status(200).send(pdfBuffer);
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
    koreanName: '학생용 요약',
    logName: 'Student summary',
    asciiFilename: 'student-summary.pdf',
    renderTemplate: renderStudentSummaryTemplate,
    createFilename: createStudentSummaryFilename,
  });
}

function downloadTeacherSummary(request, response) {
  return downloadSummaryPdf(request, response, {
    koreanName: '교사용 요약',
    logName: 'Teacher summary',
    asciiFilename: 'teacher-summary.pdf',
    renderTemplate: renderTeacherSummaryTemplate,
    createFilename: createTeacherSummaryFilename,
  });
}

module.exports = {
  downloadStudentSummary,
  downloadTeacherSummary,
};
