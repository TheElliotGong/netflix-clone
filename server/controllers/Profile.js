const models = require('../models');

const { Profile } = models;

const profilesPage = (req, res) => res.render('profiles');

const contentPage = async (req, res) => {
 
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

const createProfile = async (req, res) => {
  const { name } = req.body;

  console.log(name);
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

// const editProfile = async (req, res) => {
//   if (!req.body.name) {
//     return res.status(400).json({ error: 'Profile name is required.' });
//   }
// };

// const changeProfile = async (req, res) => {

// };

module.exports = {
  getProfiles, profilesPage, createProfile, manageProfilesPage, contentPage
};
