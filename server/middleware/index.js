const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }

  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/maker');
  }

  return next();
};

let requiresSecure = (req, res, next) => next();

if (process.env.NODE_ENV === 'production') {
  requiresSecure = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }

    return next();
  };
}

module.exports = {
  requiresLogin,
  requiresLogout,
  requiresSecure,
};