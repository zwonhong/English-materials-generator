const crypto = require('crypto');
const path = require('path');

const env = require('../config/env');

const publicDirectory = path.join(__dirname, '..', '..', 'public');

function securelyMatches(input, expected) {
  const inputBuffer = crypto
    .createHash('sha256')
    .update(String(input ?? ''))
    .digest();
  const expectedBuffer = crypto.createHash('sha256').update(expected).digest();

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

function showLoginPage(_request, response) {
  response.sendFile(path.join(publicDirectory, 'login.html'));
}

function login(request, response, next) {
  const idMatches = securelyMatches(request.body.masterId, env.masterId);
  const passwordMatches = securelyMatches(
    request.body.masterPassword,
    env.masterPassword,
  );

  if (!idMatches || !passwordMatches) {
    return response
      .status(401)
      .sendFile(path.join(publicDirectory, 'login-error.html'));
  }

  return request.session.regenerate((error) => {
    if (error) {
      return next(error);
    }

    request.session.isAuthenticated = true;

    return request.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }

      return response.redirect('/');
    });
  });
}

function logout(request, response, next) {
  request.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    response.clearCookie('english_helper_session');
    return response.redirect('/login');
  });
}

module.exports = {
  login,
  logout,
  showLoginPage,
};
