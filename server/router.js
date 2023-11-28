// Include required folders.
const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // Connect functions to url pathnames, now with middleware functions.

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);
  app.get('/changePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePasswordPage);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/content', mid.requiresLogin, controllers.Profile.contentPage);

  app.get('/profiles', mid.requiresLogin, controllers.Profile.profilesPage);
  app.get('/manageProfiles', mid.requiresLogin, controllers.Profile.profilesPage);
  app.get('/getProfiles', mid.requiresLogin, controllers.Profile.getProfiles);
  app.post('/createProfile', mid.requiresLogin, controllers.Profile.createProfile);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
