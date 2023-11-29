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

const loadProfiles = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();
    ReactDOM.render(
        <ProfileList profiles={data.profiles} />, document.querySelector("#profiles")
    );

};

const loadVideos = async () => {
    const response = await fetch('/loadVideos');
    const data = await response.json();

    
}
const loadFavoriteVideos = async () => {
    const response = await fetch('/loadProfile');
    const data = await response.json();
    ReactDOM.render(
        <FavoriteVidoes favorites={data.favorites} />, document.querySelector("#favoriteVideos")
    );
}

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
    
    loadProfiles();



};

window.onload = init;