// Import necessary content
const models = require('../models');

const { Profile } = models;
const { Account } = models;
// Render the profiles page.
const profilesPage = (req, res) => res.render('profiles');
// Render the manage profiles page, which is also on the profiles page.
const manageProfilesPage = (req, res) => {
  res.render('profiles');
};
/**
 * This function returns the profiles associated with the current account.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getProfiles = async (req, res) => {
  try {
    // Find the profiles associated with the current account.
    const query = { owner: req.session.account._id };
    const docs = await Profile.find(query).select('name favorites watched avatar').lean().exec();
    const account = await Account.findOne({ _id: req.session.account._id }).exec();
    // console.log(`premium: ${account.premium} `);
    return res.json({ profiles: docs, premium: account.premium});
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
/**
 * This function loads the content assoicated with the profile.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const loadProfile = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Profile name required' });
  }
  // Authenticate the profile and load the content page.
  return Profile.authenticate(name, (err, profile) => {
    if (err || !profile) {
      return res.status(401).json({ error: 'Profile unavailable' });
    }
    req.session.profile = Profile.toAPI(profile);
    return res.json({ redirect: '/content'});
  });
};
const getAvatar = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    return res.json({ avatar: profile.avatar });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
/**
 * This function creates a new profile under the logged in account.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createProfile = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Profile name is required.' });
  }
  const profileData = {
    name: req.body.name,
    avatar: req.body.avatar,
    owner: req.session.account._id,
  };
  try {
    const account = await Account.findOne({ _id: req.session.account._id }).exec();
    // Check if user exceeds profile limit.
    if ((account.premium === false && account.profileCount >= 5)
    || (account.premium === true && account.profileCount >= 10)) {
      return res.status(400).json({ error: 'Maximum number of profiles reached.' });
    }
    // Create and save profile.
    const newProfile = new Profile(profileData);
    await newProfile.save();

    account.profileCount += 1;
    await account.save();
    return res.status(201).json({ name: newProfile.name, avatar: newProfile.avatar, 
      owner: newProfile.owner });
  } catch (err) {
    // Catch and print errors.
    // console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Profile name is taken.' });
    }
    return res.status(500).json({ error: 'An error occured' });
  }
};
/**
 * Remove a profile from the account.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const removeProfile = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Profile name is required.' });
  }
  try {
    const account = await Account.findOne({ _id: req.session.account._id }).exec();
    const profile = await Profile.findOne({ name: req.body.name }).exec();
    // Check if profile exists or if correct account is even logged in.
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found.' });
    }
    if (profile.owner.toString() !== req.session.account._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Delete the profile and update the account.
    await Profile.deleteOne({ name: req.body.name }).exec();
    account.profileCount -= 1;
    await account.save();
    return res.status(204).end();
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

module.exports = {
  getProfiles, profilesPage, createProfile, manageProfilesPage, loadProfile, 
  removeProfile, getAvatar
};
