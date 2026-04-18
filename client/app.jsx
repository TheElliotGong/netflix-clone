const React = require('react');
const ReactDOMClient = require('react-dom/client');
const PropTypes = require('prop-types'); // eslint-disable-line import/no-extraneous-dependencies
const helper = require('./helper.js');

const roots = {};

const renderAtSelector = (selector, component) => {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  if (!roots[selector]) {
    roots[selector] = ReactDOMClient.createRoot(container);
  }

  roots[selector].render(component);
};

/**
 * This function reloads the favorite videos from the selected user profile.
 */
const reloadFavoritesFromServer = async () => {
  const response = await fetch('/getFavoriteVideos');
  const data = await response.json();
  renderAtSelector('#favoriteVideos', <FavoriteVidoes favorites={data.videos} />);
};

/**
 * This function reloads the watched videos from the selected user profile.
 */
const reloadWatchedFromServer = async () => {
  const response = await fetch('/getWatchedVideos');
  const data = await response.json();
  renderAtSelector('#recentlyWatched', <WatchedVideos watched={data.videos} />);
};
/**
 * This helper function assists with managing the favorite videos under the user profile.
 * @param {*} videoID the id of the video being edited.
 * @param {*} action the action to take on the video.
 * @returns
 */
const handleFavorites = (videoID, action) => {
  // Ensure the videoID is valid.
  if (!videoID) {
    return false;
  }
  helper.sendPost(action, { videoID }, reloadFavoritesFromServer);
  return false;
};
/**
 * This helper function assists with managing the watched videos under the user profile.
 * @param {*} videoID
 * @returns
 */
const handleWatched = (videoID) => {
  // Ensure the videoID is valid.
  if (!videoID) {
    return false;
  }
  helper.sendPost('/addToWatched', { videoID }, reloadWatchedFromServer);
  return false;
};
// This is the button that adds a video to the favorites list.
function AddToFavoritesButton(props) {
  const { videoID } = props;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleFavorites(videoID, '/addToFavorites');
      }}
    >
      Add to Favorites
    </button>
  );
}
// This is the button that removes a video from the favorites list.
function RemoveFromFavoritesButton(props) {
  const { videoID } = props;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleFavorites(videoID, '/removeFromFavorites');
      }}
    >
      Remove from Favorites
    </button>
  );
}
/**
 * This function loads in the profiles associated with the logged in account.
 * @param {*} props
 * @returns
 */
function ProfileList({ profiles }) {
  const profileNodes = profiles.map((profile) => (
    <button
      type="button"
      key={profile._id || profile.name}
      className="profile"
      onClick={(e) => {
        e.preventDefault();
        helper.handleLoadProfile(profile.name);
      }}
    >
      <img src={profile.avatar} alt="avatar" className="avatar" />
      <h3 className="name">{profile.name}</h3>
    </button>
  ));
  return (
    <div className="profileList">
      {profileNodes}
    </div>
  );
}
/**
 * This function retrieves the profiles associated with the logged in account.
 */
const getProfiles = async () => {
  const response = await fetch('/getProfiles');
  const data = await response.json();
  renderAtSelector('#profiles', <ProfileList profiles={data.profiles} />);
};
const getAvatar = async () => {
  const response = await fetch('/getAvatar');

  const data = await response.json();
  renderAtSelector('.dropdownButton', <img src={data.avatar} alt="Netflix-Avatar" />);
};
/**
 * This function loads the videos from the server.
 */
const loadVideos = async () => {
  // Fill out the popular and trending sections
  const response = await fetch('/getVideos');
  const data = await response.json();
  renderAtSelector('#popular', <Videos videos={data.videos} />);
  renderAtSelector('#trending', <Videos videos={data.videos} />);
  // Fill out the exclusive section if the user is a premium member.
  if (data.premiumStatus) {
    renderAtSelector('#exclusive', <Videos videos={data.videos} />);
  } else {
    renderAtSelector(
      '#exclusive',
      <h3 className="exclusiveMessage">Become a premium member to access exclusive content</h3>,
    );
  }
};
/**
 * This function loads the favorite videos from the server.
 */
const loadFavoriteVideos = async () => {
  const response = await fetch('/getFavoriteVideos');
  const data = await response.json();
  renderAtSelector('#favoriteVideos', <FavoriteVidoes favorites={data.videos} />);
};
/**
 * This function loads the watched videos from the server.

 */
const loadWatchedVideos = async () => {
  const response = await fetch('/getWatchedVideos');
  const data = await response.json();
  renderAtSelector('#recentlyWatched', <WatchedVideos watched={data.videos} />);
};

/**
 * This is the function that loads unwatched videos into the page.
 * @param {*} props
 * @returns
 */
function Videos({ videos }) {
  const videoNodes = videos.map((video) => (
    <div id={video._id} key={video._id} className="video">
      <button
        type="button"
        className="videoPlayer"
        onClick={(e) => {
          e.preventDefault();
          handleWatched(video._id);
        }}
      >
        <img src="/assets/img/video.png" alt="video" className="thumbnail" />
      </button>
      <p className="name">{video.name}</p>
      <p className="genre">{video.genre}</p>
      <div className="buttonContainer">
        <AddToFavoritesButton videoID={video._id} />
      </div>

    </div>
  ));
  return (
    <div className="videoList">
      {videoNodes}
    </div>
  );
}
/**
 * This function loads watched videos onto the page.
 * @param {*} props
 * @returns
 */
function WatchedVideos({ watched }) {
  // If there are no watched videos, display a message.
  if (watched.length === 0) {
    return (
      <div className="watchedVideoList">
        <h3 className="noWatched">No Watched Videos yet</h3>
      </div>
    );
  }
  const videoNodes = watched.map((video) => (
    <div id={video._id} key={video._id} className="watchedVideo">
      <img src="/assets/img/video.png" alt="video" className="thumbnail" />
      <p className="name">{video.name}</p>
      <p className="genre">{video.genre}</p>
      <div className="buttonContainer">
        <AddToFavoritesButton videoID={video._id} />
      </div>
    </div>
  ));
  return (
    <div className="videoList">
      {videoNodes}
    </div>
  );
}
/**
 * This function creates
 * @param {*} props
 * @returns
 */
function FavoriteVidoes({ favorites }) {
  // If there are no favorite videos, display a message.
  if (favorites.length === 0) {
    return (
      <div className="favoriteVideoList">
        <h3 className="noFavorites">No Favorite Videos yet</h3>
      </div>
    );
  }
  const videoNodes = favorites.map((video) => (
    <div id={video._id} key={video._id} className="favoriteVideo">
      <button
        type="button"
        className="videoPlayer"
        onClick={(e) => {
          e.preventDefault();
          handleWatched(video._id);
        }}
      >
        <img src="/assets/img/video.png" alt="video" className="thumbnail" />
      </button>
      <p className="name">{video.name}</p>
      <p className="name">{video.genre}</p>
      <div className="buttonContainer">
        <RemoveFromFavoritesButton videoID={video._id} />
      </div>

    </div>
  ));
  return (
    <div className="videoList">
      {videoNodes}
    </div>
  );
}

/**
 * Initializes the page.
 */
const init = () => {
  getProfiles();
  getAvatar();
  loadVideos();
  loadFavoriteVideos();
  loadWatchedVideos();
};

const videoShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
});

const profileShape = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
});

AddToFavoritesButton.propTypes = {
  videoID: PropTypes.string.isRequired,
};

RemoveFromFavoritesButton.propTypes = {
  videoID: PropTypes.string.isRequired,
};

ProfileList.propTypes = {
  profiles: PropTypes.arrayOf(profileShape).isRequired,
};

Videos.propTypes = {
  videos: PropTypes.arrayOf(videoShape).isRequired,
};

WatchedVideos.propTypes = {
  watched: PropTypes.arrayOf(videoShape).isRequired,
};

FavoriteVidoes.propTypes = {
  favorites: PropTypes.arrayOf(videoShape).isRequired,
};

window.onload = init;
