const models = require('../models');

const { Video } = models;

const videoInfo = [
  { name: 'Extraction', genre: 'Action' },
  { name: 'The Old Guard', genre: 'Action' },
  { name: 'The Irishman', genre: 'Crime' },
  { name: 'The Dark Knight', genre: 'Action' },
  { name: 'The Godfather', genre: 'Crime' },
  { name: 'The Godfather: Part II', genre: 'Crime' },
  { name: 'The Shawshank Redemption', genre: 'Drama' },
  { name: 'Schindler\'s List', genre: 'Drama' },
  { name: 'Inception', genre: 'Action' },
  { name: 'Pulp Fiction', genre: 'Crime' },
  { name: 'Fight Club', genre: 'Drama' },
  { name: 'Forrest Gump', genre: 'Drama' },
  { name: 'The Matrix', genre: 'Action' },
  { name: 'Goodfellas', genre: 'Crime' },
  { name: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Fantasy' },
  { name: 'The Lord of the Rings: The Two Towers', genre: 'Fantasy' },
  { name: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy' },
  { name: 'Interstellar', genre: 'Sci-Fi' },
  { name: 'Se7en', genre: 'Crime' },
  { name: 'The Silence of the Lambs', genre: 'Crime' },
  { name: 'Star Wars: Episode IV - A New Hope', genre: 'Sci-Fi' },
  { name: 'Saving Private Ryan', genre: 'Drama' },
  { name: 'The Green Mile', genre: 'Drama' },
  { name: 'The Departed', genre: 'Crime' },
  { name: 'Gladiator', genre: 'Action' },

];
for (let i = 0; i < videoInfo.length; i++) {
  const newVideo = new Video(videoInfo[i]);
  newVideo.save();
}
