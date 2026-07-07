const express = require('express');

const geminiController = require('../controllers/gemini.controller');
const { requireAuthentication } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/api/gemini/generate',
  requireAuthentication,
  geminiController.generateProjectJson,
);

module.exports = router;
