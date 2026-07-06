const express = require('express');

const pdfController = require('../controllers/pdf.controller');
const { requireAuthentication } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/api/pdf/student-summary',
  requireAuthentication,
  pdfController.downloadStudentSummary,
);

router.post(
  '/api/pdf/teacher-summary',
  requireAuthentication,
  pdfController.downloadTeacherSummary,
);

module.exports = router;
