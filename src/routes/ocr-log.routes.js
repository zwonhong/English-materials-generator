const express = require('express');

const ocrLogController = require('../controllers/ocr-log.controller');
const { requireAuthentication } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/api/ocr-log',
  requireAuthentication,
  ocrLogController.downloadOcrLog,
);

module.exports = router;
