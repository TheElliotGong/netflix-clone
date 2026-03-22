const mongoose = require('mongoose');

// Reusable TMDB-shaped subdocument schema for embedding on profiles.
const EmbeddedVideoSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    min: 1,
  },
  mediaType: {
    type: String,
    required: true,
    trim: true,
    enum: ['movie', 'tv'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  originalTitle: {
    type: String,
    required: false,
    trim: true,
  },
  overview: {
    type: String,
    required: false,
    trim: true,
  },
  posterPath: {
    type: String,
    required: false,
    trim: true,
  },
  backdropPath: {
    type: String,
    required: false,
    trim: true,
  },
  releaseDate: {
    type: String,
    required: false,
    trim: true,
  },
  firstAirDate: {
    type: String,
    required: false,
    trim: true,
  },
  voteAverage: {
    type: Number,
    required: false,
    default: 0,
  },
  voteCount: {
    type: Number,
    required: false,
    default: 0,
  },
  popularity: {
    type: Number,
    required: false,
    default: 0,
  },
  adult: {
    type: Boolean,
    required: false,
    default: false,
  },
  originalLanguage: {
    type: String,
    required: false,
    trim: true,
  },
  genreIds: {
    type: [Number],
    required: false,
    default: [],
  },
  genreNames: {
    type: [String],
    required: false,
    default: [],
  },
  // Convenience fields for current client UI.
  name: {
    type: String,
    required: true,
    trim: true,
  },
  genre: {
    type: String,
    required: false,
    trim: true,
    default: 'Unknown',
  },
}, { _id: false, id: false });

EmbeddedVideoSchema.statics.toAPI = (doc) => ({
  tmdbId: doc.tmdbId,
  mediaType: doc.mediaType,
  title: doc.title,
  originalTitle: doc.originalTitle,
  overview: doc.overview,
  posterPath: doc.posterPath,
  backdropPath: doc.backdropPath,
  releaseDate: doc.releaseDate,
  firstAirDate: doc.firstAirDate,
  voteAverage: doc.voteAverage,
  voteCount: doc.voteCount,
  popularity: doc.popularity,
  adult: doc.adult,
  originalLanguage: doc.originalLanguage,
  genreIds: doc.genreIds,
  genreNames: doc.genreNames,
  name: doc.name,
  genre: doc.genre,
});

module.exports = EmbeddedVideoSchema;
