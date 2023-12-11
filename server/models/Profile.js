const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();
let ProfileModel = {};
//Define profile schema
const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  favorites: {
    type: [mongoose.Schema.ObjectId],
    required: false,
    ref: 'Video',
  },
  watched: {
    type: [mongoose.Schema.ObjectId],
    required: false,
    ref: 'Video',
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});
//Hep store profile in redis
ProfileSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  _id: doc._id,
});
//Authenticate profile when needed
ProfileSchema.statics.authenticate = async (name, callback) => {
  try {
    const doc = await ProfileModel.findOne({ name }).exec();
    if (!doc) {
      return callback();
    }
    return callback(null, doc);
  } catch (err) {
    return callback(err);
  }
};

ProfileModel = mongoose.model('Profile', ProfileSchema);
module.exports = ProfileModel;
