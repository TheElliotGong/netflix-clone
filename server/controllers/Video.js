const models = require('../models');

const { Video } = models;
const { Profile } = models;

const contentPage = async (req, res) => {
  res.render('app');
};
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
    const docs = await Video.find({ _id: { $in: profile.favorites } }).lean().exec();
    return res.json({ favorites: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const videoID = req.body.videoID;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    profile.favorites.push(videoID);
    await Profile.save();
    return res.status(200).json({ message: 'Video added to favorites' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const removeFromFavorites = async (req, res) => {
  try
  {
    const videoID = req.body.videoID;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    profile.favorites.pull(videoID);
    await Profile.save();
    return res.status(200).json({ message: 'Video removed from favorites' });
  }catch(err)
  {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

module.exports = {
  getVideos, contentPage, getFavoriteVideos, addToFavorites, removeFromFavorites
};
