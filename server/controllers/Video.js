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
  const profile = await Profile.find({ name: req.query.name }).populate('favorites').select('name favorites').lean()
    .exec();
  return res.json({ favorites: profile.favorites });
};
const contentPage = async (req, res) => {
  res.render('app');
};

module.exports = { getVideos, contentPage, getFavoriteVideos };
