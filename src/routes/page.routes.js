const express = require('express');
const path = require('path');

const { requireAuthentication } = require('../middleware/auth');

const router = express.Router();
const mainPage = path.join(__dirname, '..', '..', 'public', 'main.html');

router.get('/', requireAuthentication, (_request, response) => {
  response.sendFile(mainPage);
});

module.exports = router;
