const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');



/**
 * This form only runs when creating a new profile, which should update the manage profiles page on completion.
 * @param {*} e 
 * @returns 
 */
const handleProfileCreation = (e) => {
    e.preventDefault();
    // helper.hideError();
    const profileName = e.target.querySelector('#profileName').value;
    console.log(profileName);
    if (!profileName) {
        // helper.handleError('Name is required!');
        return false;
    }

    helper.sendPost(e.target.action, { profileName }, reloadProfilesFromServer);

    
    return false;
};

const handleLoadProfile = (e) => {
    e.preventDefault();
    const profileName = e.target.value;
    console.log(profileName);
    if (!profileName) {
        // helper.handleError('Name is required!');
        return false;
    }
    helper.sendPost('/loadProfile', { profileName });
    return false;
}

const createProfileForm = () => {
    return <div>
        <form id="createProfileForm" onSubmit={handleProfileCreation} action='/createProfile' method="POST">
            <label htmlFor='profileName'>Name: </label>
            <input id="profileName" type="text" name="profileName" placeholder="Name" />
            <input className="formSubmit" type="submit" value="Create Profile" />
        </form>
    </div>
};

const Profiles = (props) => {


    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return <a href = '/content' onclick={handleLoadProfile} className='profile' value = {profile.name}>
                < img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' />
                <h3 id ='profileName'>{profile.name}</h3>
            </a>
        });
        return (
            <div className="profiles">
                <h1>Who's Watching?</h1>
                <div id = "profileRow">
                    {profileNodes}
                </div>
                <a href="/manageProfiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<ManageProfiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Manage Profiles</a>
            </div>
        );
    }
    else {
        return (
            <div className="profiles">
                <h1>No Profiles Yet</h1>
                <a href="/manageProfiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<ManageProfiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Manage Profiles</a>
            </div>
        );

    }

};

const ManageProfiles = (props) => {

    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return <div key={profile._id} className='profile'>
                <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h3 className='name' >{profile.name}</h3>
            </div>
        });

        return (
            <div className="profiles">
                <h1>Manage Profiles:</h1>
                <div id = "profileRow">
                    {profileNodes}
                </div>
                
                {createProfileForm()}
                <a href="/profiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<Profiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Done</a>
            </div>
        );
    }
    else {
        return (
            <div className="profiles">
                <h1>No Profiles Yet</h1>
                {createProfileForm()}
                <a href="/profiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<Profiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Done</a>
            </div>
        );

    }
};


const reloadProfilesFromServer = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();

    //Render the domos under the selected html element.

    ReactDOM.render(
        <ManageProfiles profiles={data.profiles} />, document.querySelector("#profileContent")
    );
};

const init = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();

    //Render the domos under the selected html element.

    ReactDOM.render(
        <Profiles profiles={data.profiles} />, document.querySelector("#profileContent")
    );
};




window.onload = init;