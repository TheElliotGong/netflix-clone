const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();
let ProfileModel = {};
const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  favorites: {
    type: [String],
    required: false,
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

ProfileSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  favorites: doc.favorites,
});

ProfileModel = mongoose.model('Profile', ProfileSchema);
module.exports = ProfileModel;