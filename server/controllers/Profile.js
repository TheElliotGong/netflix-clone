const models = require('../models');

const { Profile } = models;
const { Account } = models;
const profilesPage = (req, res) => res.render('profiles');

const manageProfilesPage = (req, res) => {
  res.render('profiles');
};
const getProfiles = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Profile.find(query).select('name favorites').lean().exec();

    return res.json({ profiles: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const loadProfile = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Profile name required' });
  }
  return Profile.authenticate(name, (err, profile) => {
    if (err || !profile) {
      return res.status(401).json({ error: 'Profile unavailable' });
    }
    req.session.profile = Profile.toAPI(profile);
    return res.json({ redirect: '/content' });
  });
};

const createProfile = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Profile name is required.' });
  }
  const profileData = {
    name: req.body.name,
    owner: req.session.account._id,
  };
  try {
    const account = await Account.findOne({ _id: req.session.account._id }).exec();
    // Check if user exceeds profile limit.
    if ((account.premium === false && account.profileCount >= 5)
    || (account.premium === true && account.profileCount >= 8)) {
      return res.status(400).json({ error: 'Maximum number of profiles reached.' });
    }
    const newProfile = new Profile(profileData);
    await newProfile.save();

    account.profileCount += 1;
    await account.save();
    return res.status(201).json({ name: newProfile.name, owner: newProfile.owner });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Profile name is taken.' });
    }
    return res.status(500).json({ error: 'An error occured' });
  }
};

module.exports = {
  getProfiles, profilesPage, createProfile, manageProfilesPage, loadProfile,
};
