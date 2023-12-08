const models = require('../models');

const { Video } = models;
const { Profile } = models;

const contentPage = async (req, res) => {
  res.render('app');
};
const getVideos = async (req, res) => {
  try {
    const docs = await Video.find();
    const premiumStatus = req.session.account.premium;
    return res.json({ videos: docs, premiumStatus });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const getFavoriteVideos = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    const docs = await Video.find({ _id: { $in: profile.favorites } }).lean().exec();
    return res.json({ favorites: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const { videoID } = req.body;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    // Check if video is already included in favorites
    if (profile.favorites.includes(videoID)) {
      return res.status(409).json({ message: 'Video already in favorites' });
    }
    profile.favorites.push(videoID);
    await profile.save();
    return res.status(200).json({ message: 'Video added to favorites' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { videoID } = req.body;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    if (!profile.favorites.includes(videoID)) {
      return res.status(404).json({ message: 'Video not in favorites' });
    }
    profile.favorites.pull(videoID);
    await profile.save();
    return res.status(200).json({ message: 'Video removed from favorites' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

module.exports = {
  contentPage, getVideos, getFavoriteVideos, addToFavorites, removeFromFavorites,
};
