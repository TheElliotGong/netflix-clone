// Import necessary content
const axios = require('axios');
const models = require('../models');

const { Profile } = models;

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

let genreCache = {
  expiresAt: 0,
  map: {},
};

const getTMDBHeaders = () => {
  if (!TMDB_API_TOKEN) {
    return { accept: 'application/json' };
  }

  return {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_TOKEN}`,
  };
};

const getTMDBAuthParams = () => {
  if (!TMDB_API_TOKEN && TMDB_API_KEY) {
    return { api_key: TMDB_API_KEY };
  }

  return {};
};

const requireTMDBCredentials = () => {
  if (!TMDB_API_TOKEN && !TMDB_API_KEY) {
    throw new Error('Missing TMDB credentials. Set TMDB_API_TOKEN or TMDB_API_KEY.');
  }
};

const createCompositeId = (mediaType, tmdbId) => `${mediaType}-${tmdbId}`;

const normalizeTMDBVideo = (video, genreMap) => {
  const mediaType = video.media_type === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(video.id);
  const title = (video.title || video.name || '').trim();
  const genreIds = Array.isArray(video.genre_ids) ? video.genre_ids : [];
  const genreNames = genreIds
    .map((id) => genreMap[id])
    .filter(Boolean);

  return {
    _id: createCompositeId(mediaType, tmdbId),
    tmdbId,
    mediaType,
    title,
    originalTitle: (video.original_title || video.original_name || '').trim(),
    overview: (video.overview || '').trim(),
    posterPath: video.poster_path || '',
    backdropPath: video.backdrop_path || '',
    releaseDate: video.release_date || '',
    firstAirDate: video.first_air_date || '',
    voteAverage: Number(video.vote_average || 0),
    voteCount: Number(video.vote_count || 0),
    popularity: Number(video.popularity || 0),
    adult: Boolean(video.adult),
    originalLanguage: (video.original_language || '').trim(),
    genreIds,
    genreNames,
    // Backward compatible aliases used by the client.
    name: title,
    genre: genreNames.join(', ') || 'Unknown',
  };
};

const getGenreMap = async () => {
  const now = Date.now();
  if (genreCache.expiresAt > now && Object.keys(genreCache.map).length > 0) {
    return genreCache.map;
  }

  const headers = getTMDBHeaders();
  const params = {
    language: 'en-US',
    ...getTMDBAuthParams(),
  };

  const [movieGenresRes, tvGenresRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/genre/movie/list`, { headers, params }),
    axios.get(`${TMDB_BASE_URL}/genre/tv/list`, { headers, params }),
  ]);

  const genres = [
    ...(movieGenresRes.data.genres || []),
    ...(tvGenresRes.data.genres || []),
  ];

  const map = genres.reduce((acc, genre) => {
    if (genre && genre.id) {
      acc[genre.id] = genre.name;
    }
    return acc;
  }, {});

  genreCache = {
    map,
    expiresAt: now + (60 * 60 * 1000),
  };

  return map;
};

const findVideoIndex = (videos, tmdbId, mediaType) => videos.findIndex(
  (video) => Number(video.tmdbId) === Number(tmdbId) && video.mediaType === mediaType,
);

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
    requireTMDBCredentials();

    const headers = getTMDBHeaders();
    const params = {
      language: 'en-US',
      ...getTMDBAuthParams(),
    };
    const genreMap = await getGenreMap();

    const [trendingMoviesRes, trendingTvRes] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/trending/movie/day`, { headers, params }),
      axios.get(`${TMDB_BASE_URL}/trending/tv/day`, { headers, params }),
    ]);

    const videos = [
      ...(trendingMoviesRes.data.results || []).map((video) => ({ ...video, media_type: 'movie' })),
      ...(trendingTvRes.data.results || []).map((video) => ({ ...video, media_type: 'tv' })),
    ].map((video) => normalizeTMDBVideo(video, genreMap));

    const premiumStatus = req.session.account.premium;
    return res.json({ videos, premiumStatus });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'An error occured' });
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
      docs = profile.favorites || [];
    }
    if (req.url === '/getWatchedVideos') {
      docs = profile.watched || [];
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
    const { videoID, mediaType = 'movie', video } = req.body;
    const tmdbId = Number(videoID || (video && video.tmdbId));
    const canonicalMediaType = mediaType === 'tv' ? 'tv' : 'movie';

    if (!tmdbId || !video) {
      return res.status(400).json({ error: 'video and videoID are required' });
    }

    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();

    const normalizedVideo = {
      tmdbId,
      mediaType: canonicalMediaType,
      title: video.title || video.name,
      originalTitle: video.originalTitle || '',
      overview: video.overview || '',
      posterPath: video.posterPath || '',
      backdropPath: video.backdropPath || '',
      releaseDate: video.releaseDate || '',
      firstAirDate: video.firstAirDate || '',
      voteAverage: Number(video.voteAverage || 0),
      voteCount: Number(video.voteCount || 0),
      popularity: Number(video.popularity || 0),
      adult: Boolean(video.adult),
      originalLanguage: video.originalLanguage || '',
      genreIds: Array.isArray(video.genreIds) ? video.genreIds : [],
      genreNames: Array.isArray(video.genreNames) ? video.genreNames : [],
      name: video.name || video.title || 'Untitled',
      genre: video.genre || 'Unknown',
    };

    // See if the video already exists in the favorites list.
    if (req.url === '/addToFavorites') {
      if (findVideoIndex(profile.favorites, tmdbId, canonicalMediaType) >= 0) {
        return res.status(409).json({ message: 'Video already in Favorites' });
      }
      profile.favorites.push(normalizedVideo);
      await profile.save();
    }
    // See if the video already exists in the watched list.
    if (req.url === '/addToWatched') {
      if (findVideoIndex(profile.watched, tmdbId, canonicalMediaType) >= 0) {
        return res.status(409).json({ message: 'Video already in watched' });
      }
      profile.watched.push(normalizedVideo);
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
    const { videoID, mediaType = 'movie' } = req.body;
    const tmdbId = Number(videoID);
    const canonicalMediaType = mediaType === 'tv' ? 'tv' : 'movie';

    if (!tmdbId) {
      return res.status(400).json({ error: 'videoID is required' });
    }

    const profile = await Profile.findOne({ _id: req.session.profile._id }).exec();
    const favoriteIndex = findVideoIndex(profile.favorites, tmdbId, canonicalMediaType);
    if (favoriteIndex < 0) {
      return res.status(404).json({ message: 'Video not in favorites' });
    }
    profile.favorites.splice(favoriteIndex, 1);
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
