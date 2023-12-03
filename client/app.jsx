const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleFavorites = (videoID, action) => {
    
        if (!videoID) {
            // helper.handleError('Name is required!');
            return false;
        }
        console.log(videoID);
        helper.sendPost(action, { videoID }, reloadFavoritesFromServer);
        return false;
    }
const AddToFavoritesButton = (props) => {
    return <button onClick = {(e)=>{e.preventDefault(); handleFavorites(props.videoID, '/addToFavorites');}}>Add to Favorites</button>
};

const RemoveFromFavoritesButton = (props) => {
    return <button onClick = {(e)=>{e.preventDefault(); handleFavorites(props.videoID, '/removeFromFavorites');}}>Remove from Favorites</button>
};

const reloadFavoritesFromServer = async () => {
    const response = await fetch('/getFavoriteVideos');
    const data = await response.json();

    //Render the domos under the selected html element.

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

const loadVideos = async () => {
    const response = await fetch('/getVideos');
    const data = await response.json();  
    ReactDOM.render(
        <Videos videos={data.videos} />, document.querySelector("#popular")
    );  
    ReactDOM.render(
        <Videos videos={data.videos} />, document.querySelector("#trending")
    );  
}
const loadFavoriteVideos = async () => {
    const response = await fetch('/getFavoriteVideos');
    const data = await response.json();
    console.log(data);
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