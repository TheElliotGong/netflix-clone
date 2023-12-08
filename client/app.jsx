const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
/**
 * This helper function assists with managing the favorite videos under the user profile.
 * @param {*} videoID the id of the video being edited.
 * @param {*} action the action to take on the video.
 * @returns 
 */
const handleFavorites = (videoID, action) => {
        //Ensure the videoID is valid.
        if (!videoID) {
            return false;
        }
        helper.sendPost(action, { videoID }, reloadFavoritesFromServer);
        return false;
    }
//This is the button that adds a video to the favorites list.
const AddToFavoritesButton = (props) => {
    return <button onClick = {(e)=>{e.preventDefault(); handleFavorites(props.videoID, '/addToFavorites');}}>Add to Favorites</button>
};
//This is the button that removes a video from the favorites list.
const RemoveFromFavoritesButton = (props) => {
    return <button onClick = {(e)=>{e.preventDefault(); handleFavorites(props.videoID, '/removeFromFavorites');}}>Remove from Favorites</button>
};
/**
 * This function reloads the favorite videos from the selected user profile.
 */
const reloadFavoritesFromServer = async () => {
    const response = await fetch('/getFavoriteVideos');
    const data = await response.json();
    ReactDOM.render(
        <FavoriteVidoes favorites={data.favorites} />, document.querySelector("#favoriteVideos")
    );
};

const ProfileList = (props) => {
    const profileNodes = props.profiles.map(profile => {
        return <button className='profile' onClick = {(e)=>{e.preventDefault();helper.handleLoadProfile(profile.name);}}>
            <img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' />
            <h3 className='name' >{profile.name}</h3>
        </button>
    });
    return (<div className="profileList">
        {profileNodes}
    </div>);
};

const getProfiles = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();
    ReactDOM.render(
        <ProfileList profiles={data.profiles} />, document.querySelector("#profiles")
    );

};
/**
 * This function loads the videos from the server.
 */
const loadVideos = async () => {
    //Fill out the popular and trending sections
    const response = await fetch('/getVideos');
    const data = await response.json();  
    ReactDOM.render(
        <Videos videos={data.videos} />, document.querySelector("#popular")
    );  
    ReactDOM.render(
        <Videos videos={data.videos} />, document.querySelector("#trending")
    );  
    //Fill out the exclusive section if the user is a premium member.
    if(data.premiumStatus)
    {
        ReactDOM.render(<Videos videos={data.videos} />, document.querySelector("#exclusive"));
    }
    else
    {
        ReactDOM.render(<h3 className="exclusiveMessage">Become a premium member to access exclusive content</h3>, document.querySelector("#exclusive"));
    }
}
const loadFavoriteVideos = async () => {
    const response = await fetch('/getFavoriteVideos');
    const data = await response.json();
    ReactDOM.render(
        <FavoriteVidoes favorites={data.favorites} />, document.querySelector("#favoriteVideos")
    );
}


const Videos = (props) => {
    const videoNodes = props.videos.map(video => {
        return <div id={video._id} className='video'>
            <img src='/assets/img/video.png' alt = "video" class = "thumbnail" />
            <p className='name' >{video.name}</p>
            <p className='genre' >{video.genre}</p>
            <div className = "buttonContainer">
                <AddToFavoritesButton videoID = {video._id} />
            </div>
            
        </div>
    });
    return (<div className="videoList">
        {videoNodes}
    </div>);
};
const FavoriteVidoes = (props) => {
    if(props.favorites.length === 0)
    {
        return(
            <div className="favoriteVideoList">
                <h3 className="noFavorites">No Favorite Videos yet</h3>
            </div>
        );
    }
    const videoNodes = props.favorites.map(video => {
        return <div id={video._id} className='favoriteVideo'>
            <img src='/assets/img/video.png' alt = "video" class = "thumbnail" />
            <p className='name' >{video.name}</p>
            <p className='name' >{video.genre}</p>
            <div className = "buttonContainer">
              <RemoveFromFavoritesButton videoID = {video._id} />
            </div>
            
        </div>
    });
    return (<div className="videoList">
        {videoNodes}
    </div>);
};


/**
 * Initializes the page.
 */
const init = () => {
    
    getProfiles();
    loadVideos();
    loadFavoriteVideos();

};

window.onload = init;