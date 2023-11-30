const models = require('../models');

const { Profile } = models;

const profilesPage = (req, res) => res.render('profiles');

const contentPage = async (req, res) => {
  req.session.profile = req.body.profileName;

  res.render('app');
};

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
  const { name } = req.query;
  return Profile.ToAPI(name, (err, profile) => {
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
    const newProfile = new Profile(profileData);
    await newProfile.save();
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
  getProfiles, profilesPage, createProfile, manageProfilesPage, contentPage, loadProfile,
};
