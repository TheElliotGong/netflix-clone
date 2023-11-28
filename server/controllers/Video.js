const models = require('../models');

const { Video } = models;

const videoInfo = [
  { name: 'Pluto', genre: 'Anime' },
  { name: 'Naruto', genre: 'Anime' },
  { name: 'Bleach', genre: 'Anime' },
  { name: 'One Piece', genre: 'Anime' },
  { name: 'Dragon Ball Z', genre: 'Anime' },
  { name: 'Dragon Ball Super', genre: 'Anime' },
  { name: 'My Hero Academia', genre: 'Anime' },
  { name: 'Attack on Titan', genre: 'Anime' },
  { name: 'Death Note', genre: 'Anime' },
  { name: 'Fullmetal Alchemist: Brotherhood', genre: 'Anime' },
  { name: 'Cowboy Bebop', genre: 'Anime' },
  { name: 'Sword Art Online', genre: 'Anime' },

];
for (let i = 0; i < videoInfo.length; i++) {
  const newVideo = new Video(videoInfo[i]);
  newVideo.save();
}
