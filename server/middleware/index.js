/*
Author: Elliot Gong
Purpose: Create middleware functions for handling login and logout.
 */

/**
 * Take the user to the home page if their account isn't connected to the session.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};
/**
 * Take the user to their accout page if it's' attached to the session.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/profiles');
  }
  return next();
};
/**
 * Ensure that client is using https
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};
/**
 * Bypass the https check for the client.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const bypassSecure = (req, res, next) => {
  next();
};
// Export functions.
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

// bypass https checks for debug mode.
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
