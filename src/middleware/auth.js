function requireAuthentication(request, response, next) {
  if (request.session?.isAuthenticated) {
    return next();
  }

  return response.redirect('/login');
}

function redirectAuthenticatedUser(request, response, next) {
  if (request.session?.isAuthenticated) {
    return response.redirect('/');
  }

  return next();
}

module.exports = {
  redirectAuthenticatedUser,
  requireAuthentication,
};
