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
        return <div key={profile._id} className='profile'>
            <a href='/content' onClick={(e)=>{document.cookie = 'profile='+profile._id}}>< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></a>
            <h3 className='name' >{profile.name}</h3>
        </div>
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
    const response = await fetch('/loadProfile');
    const data = await response.json();
    ReactDOM.render(
        <FavoriteVidoes favorites={data.favorites} />, document.querySelector("#favoriteVideos")
    );
}

const Videos = (props) => {
    if(props.videos.length === 0)
    {
        return(
            <div className="videoList">
                <h3 className="noVideos">No Videos yet</h3>
            </div>
        );
    }
    const videoNodes = props.videos.map(video => {
        return <div id={video._id} className='video'>
            <h3 className='name' >{video.name}</h3>
            <h3 className='name' >{video.genre}</h3>
            <button >Add to Favorites</button>
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
};


/**
 * Initializes the page.
 */
const init = () => {
    
    getProfiles();
    loadVideos();


};

window.onload = init;