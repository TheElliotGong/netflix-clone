const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
/**
 * This function handles the creation of a domo.
 * @param {*} e 
 * @returns 
 */

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
            <h4 className='name' >{video.name}</h4>
            <h4 className='genre' >{video.genre}</h4>
            <button class = "favoriteButton">Add to Favorites</button>
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
            <h3 className='name' >{video.name}</h3>
            <h4 className='name' >{video.genre}</h4>
            <button class = "favoriteButton">Remove from Favorites</button>
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