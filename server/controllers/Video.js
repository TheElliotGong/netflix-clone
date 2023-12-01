const models = require('../models');

const { Video } = models;
const { Profile } = models;

const getVideos = async (req, res) => {
  try {
    const docs = await Video.find();
    return res.json({ videos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const getFavoriteVideos = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    let docs = [];
    for(let id of profile.favorites)
    {
      const doc = await Video.findById(id).lean().exec();
      docs.push(doc);
    }
    return res.json({ favorites: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
const contentPage = async (req, res) => {
  res.render('app');
};

module.exports = { getVideos, contentPage, getFavoriteVideos };
