const express = require('express');

const geminiTestController = require('../controllers/gemini-test.controller');
const { requireAuthentication } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/gemini-test',
  requireAuthentication,
  geminiTestController.showTestPage,
);
router.post(
  '/api/gemini/generate',
  requireAuthentication,
  geminiTestController.runStructuredOutputTest,
);

module.exports = router;
