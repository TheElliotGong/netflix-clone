// Import necessary content
const models = require('../models');

const { Video } = models;
const { Profile } = models;
// Render the main content page.
const contentPage = async (req, res) => {

  res.render('app');
};
/**
 * This function gets all the video documents stored in the mongodb database.
 * @param {*} req
 * @param {*} res
 * @returns
 */


const getVideos = async (req, res) => {
  try {
    // Get all videos from the database.
    const docs = await Video.find({}).lean().exec();
    const premiumStatus = req.session.account.premium;
    return res.json({ videos: docs, premiumStatus });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

/**
 * This function returns the watched or favorite videos under the currently open profile.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getSpecialVideos = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.session.profile._id }).lean().exec();
    let docs;
    // Return different types of videos depending on the request url
    if (req.url === '/getFavoriteVideos') {
      docs = await Video.find({ _id: { $in: profile.favorites } }).lean().exec();
    }
    if (req.url === '/getWatchedVideos') {
      docs = await Video.find({ _id: { $in: profile.watched } }).lean().exec();
    } return res.json({ videos: docs });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
/**
 * This function adds a video to the open profile's favorites or watched lists.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const addSpecialVideo = async (req, res) => {
  try {
    const { videoID } = req.body;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    // See if the video already exists in the favorites list.
    if (req.url === '/addToFavorites') {
      if (profile.favorites.includes(videoID)) {
        // console.log("Video already in favorites");
        // return;
        return res.status(409).json({ message: 'Video already in Favorites' });
      }
      profile.favorites.push(videoID);
      await profile.save();
    }
    // See if the video already exists in the watched list.
    if (req.url === '/addToWatched') {
      if (profile.watched.includes(videoID)) {
        // console.log("Video already in watched");
        // return;
        return res.status(409).json({ message: 'Video already in watched' });
      }
      profile.watched.push(videoID);
      await profile.save();
    }
    return res.status(200).json({ message: 'Successful save' });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};
/**
 * This function removes a video from the open profile's favorites list.
 * @param {*} req
 * @param {*} res
 * @returns
 */
const removeFromFavorites = async (req, res) => {
  try {
    // Check if video is in favorites and remove it if it is there.
    const { videoID } = req.body;
    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    if (!profile.favorites.includes(videoID)) {
      return res.status(404).json({ message: 'Video not in favorites' });
    }
    profile.favorites.pull(videoID);
    await profile.save();
    return res.status(200).json({ message: 'Video removed from favorites' });
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: 'An error occured' });
  }
};

module.exports = {
  contentPage, getVideos, getSpecialVideos, addSpecialVideo, removeFromFavorites,
};
