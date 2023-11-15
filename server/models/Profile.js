const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
      },
    favorites: {
        type: [String],
        required: true,  
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
      },
});

ProfileSchema.statics.toAPI = (doc) => ({
   name: doc.name,
    favorites: doc.favorites,
  });

const ProfileModel = mongoose.model('Profile', ProfileSchema);
module.exports = ProfileModel;