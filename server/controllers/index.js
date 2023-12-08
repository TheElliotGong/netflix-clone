const notFoundPage = (req, res) => res.render('notFound', { page: req.url });
const Account = require('./Account.js');
const Profile = require('./Profile.js');
const Video = require('./Video.js');

module.exports = {
  Account,
  Profile,
  Video,
  notFoundPage,
};
