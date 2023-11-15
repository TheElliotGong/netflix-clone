const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const VideoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Profile',
    },
});

VideoSchema.statics.toAPI = (doc) => ({
    name: doc.name,
});

const VideoModel = mongoose.model('Video', VideoSchema);
module.exports = VideoModel;