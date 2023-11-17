const models = require('../models');
const bcrypt = require('bcrypt');
const { Account } = models;
/**
 * Render the login page.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const loginPage = (req, res) => res.render('login');


/**
 * Render the change password page.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const changePasswordPage = (req, res) => res.render('changePassword');
/**
 * End the session upon a logout.
 * @param {*} req
 * @param {*} res
 */
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
/**
 * This handles the login process for the Domomaker app.
 * @param {*} req
 * @param {*} res
 * @returns the account page if successful, or an error if unsuccessful.
 */
const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  // Ensure all text fields are filled in.
  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Check if username and password are correct.
  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/profiles' });
  });
};
/**
 * This handles the signup process for the Domomaker app.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  // Ensure all text fields are filled in.
  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Ensure passwords match.
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Create new account from data. Open new account page when successful.
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/profiles' });
  } catch (err) {
    // If username is already in use, return error.
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(500).json({ error: 'An error occurred' });
  }
};
/**
 * This function changes the password of the current user.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const changePassword = async (req, res) => {

  const account = await Account.findById(req.session.account._id);
  const currentPass = `${req.body.currentPass}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  // Validate new password/input.
  if (!pass || !pass2 || !currentPass) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (pass !== pass2) {
    return res.status(400).json({ error: 'New Passwords do not match' });
  }
  //Check if the current password is verified.
  let passwordVerification = await bcrypt.compare(currentPass, account.password);
  if(!passwordVerification){
    return res.status(400).json({ error: 'You must verify your current password' });
  }
  const newHash = await Account.generateHash(pass);
  if(newHash === account.password){
    return res.status(400).json({ error: 'New password cannot be the same as old password' });
  }
  try {
    // Locate account attached to current session, and change password.
    account.password = newHash;
    // Save account and have player log out.
    await account.save();
    return res.json({ redirect: '/logout' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred' });
  }
};

//Export functions
module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePassword,
  changePasswordPage,

};
