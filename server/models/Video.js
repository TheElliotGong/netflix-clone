const mongoose = require('mongoose');

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

VideoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  genre: doc.genre,
});

const VideoModel = mongoose.model('Video', VideoSchema);
module.exports = VideoModel;
