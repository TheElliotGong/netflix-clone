const mongoose = require('mongoose');
// Define video schema
const VideoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
});
// Store video in redis if needed
VideoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  genre: doc.genre,
});

const VideoModel = mongoose.model('Video', VideoSchema);
module.exports = VideoModel;
