const models = require('../models');
const {Profile} = models;

const contentPage = (req, res) => res.render('app');
const profilesPage = (req, res) => res.render('profiles');
const getProfiles = async (req, res) => {
    try {
      const query = { owner: req.session.account._id };
      const docs = await Profile.find(query).select('name favorites').lean().exec();
  
      return res.json({ profiles: docs });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occured' });
    }
  }
module.exports = {contentPage, getProfiles, profilesPage};