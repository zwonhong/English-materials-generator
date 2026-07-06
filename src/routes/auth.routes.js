const express = require('express');
const { rateLimit } = require('express-rate-limit');

const authController = require('../controllers/auth.controller');
const { redirectAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => {
    response
      .status(429)
      .send('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.');
  },
});

router.get('/login', redirectAuthenticatedUser, authController.showLoginPage);
router.post(
  '/login',
  redirectAuthenticatedUser,
  loginLimiter,
  authController.login,
);
router.post('/logout', authController.logout);

module.exports = router;
