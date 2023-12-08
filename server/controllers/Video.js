const models = require('../models');

const { Video } = models;
const { Profile } = models;

const contentPage = async (req, res) => {
  res.render('app');
};
const getVideos = async (req, res) => {
  try {
    // const docs = await Video.aggregate([
    //   { $sample: { size: 10 } }
    // ]);
    const docs = await Video.find({}).lean().exec();
    const premiumStatus = req.session.account.premium;
    return res.json({ videos: docs, premiumStatus });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

const getSpecialVideos = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    let docs;
    if (req.url === '/getFavoriteVideos') {
      docs = await Video.find({ _id: { $in: profile.favorites } }).lean().exec();
      return res.json({ favorites: docs });
    }
    else if (req.url === '/getWatchedVideos') {
      docs = await Video.find({ _id: { $in: profile.watched } }).lean().exec();
      return res.json({ watched: docs });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
const addSpecialVideo = async (req, res) => {
  try {
    const videoID = req.body.videoID;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    if (req.url === '/addToFavorites') {
      if (profile.favorites.includes(videoID)) {
        return res.status(409).json({ message: 'Video already in Favorites' });
      }
      profile.favorites.push(videoID);
      await profile.save();
      return res.status(200).json({ message: 'Video added to favorites' });

    }
    else if (req.url === '/addToWatched') {
      if (profile.watched.includes(videoID)) {
        return res.status(409).json({ message: 'Video already in watched' });

      }
      profile.watched.push(videoID);
      await profile.save();
      return res.status(200).json({ message: 'Video added to Watched' });
    }

    // Check if video is already included in favorites

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
  contentPage, getVideos, getSpecialVideos, addSpecialVideo, removeFromFavorites,
};
