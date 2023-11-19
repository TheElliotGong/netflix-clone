const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const handleProfile = (e) => {
    e.preventDefault();
    helper.hideError();

    const profileName = e.target.querySelector('#name').value;
    if(!profileName)
    {
        helper.handleError('Profile Name is required.');
        return false;
    }
    helper.sendPost(e.target.action, {profileName});
    return false;
};
const createProfileForm = () => {
    return <div>
        <form id="createProfileForm" onSubmit={handleProfile} action='/createProfile' method="POST">
            <label htmlFor='name'>Name: </label>
            <input id="name" type="text" name="name" placeholder="Name" />
            <input className="formSubmit" type="submit" value="Create Profile" />
        </form>
    </div>
};
const manageProfileList = (props) => {
    if(props.profiles.length === 0)
    {
        return(
            <div className="profileList">
                <h2>No Profiles yet</h2>
                {createProfileForm()}
                <button id = "done">Done</button>
            </div>
        );
    }
    const profileNodes = props.profiles.map(profile => {
        return <div key={profile._id} className='profile'>
           <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
              <h3 className='profileName' onclick={(e) => {e.preventDefault();ReactDOM.render(manageProfileList, document.querySelector("#accountProfiles"));}}>Name: {profile.name}</h3>

        </div>
    });
    return(
        <div className="profileList">
            {profileNodes}
            {createProfileForm()}
            <button id = "done">Done</button>
        </div>
    );
};
const ProfileList = (props) => {
    //Check if domos exist.
    if(props.profiles.length === 0)
    {
        return(
            <div className="profileList">
                <h2>No Profiles yet</h2>
                <button id = "manageProfiles" onclick={(e) => {e.preventDefault();ReactDOM.render(manageProfileList, document.querySelector("#accountProfiles"));}}>Manage Profiles</button>
            </div>
        );
    }
    //Otherwise, create html elements from each domo object.
    const profileNodes = props.profiles.map(profile => {
        return <div key={profile._id} className='profile'>
           <a href='/content'>< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></a>
              <h3 className='profileName' onclick={(e) => {e.preventDefault();ReactDOM.render(manageProfileList, document.querySelector("#accountProfiles"));}}>Name: {profile.name}</h3>

        </div>
    });
    //Return the domo list.
    return(
        <div className="profileList">
            {profileNodes}
            <button id = "manageProfiles" onclick={(e) => {e.preventDefault();ReactDOM.render(manageProfileList, document.querySelector("#accountProfiles"));}}>Manage Profiles</button>
        </div>
    );
};
const loadProfilesFromServer = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();
    //Render the domos under the selected html element.
    ReactDOM.render(
        <ProfileList profiles={data.profiles} />, document.querySelector("#accountProfiles")
    );
};
const manageProfiles = async () =>{

};
const loadProfile = (e) => {
    const profileName = e.target.value;
};

const init = async () => {
    await loadProfilesFromServer();

    document.querySelector("#manageProfiles").addEventListener("click", manageProfiles);
    
};

window.onload = init;