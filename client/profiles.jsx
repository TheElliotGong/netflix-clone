const { set } = require('mongoose');
const helper = require('./helper.js');
const React = require('react');
const { useState } = React;
const ReactDOM = require('react-dom');

/**
 * This form only runs when creating a new profile, which should update the manage profiles page on completion.
 * @param {*} e 
 * @returns 
 */
const handleProfileCreation = (e) => {
    e.preventDefault();
    helper.hideError();
    const name = e.target.querySelector('#profileName').value;
    const avatar = e.target.querySelector('input[name="avatar"]:checked').value;
    console.log(avatar);
    //Check for errors.
    if (!name) {
        helper.handleError('Name is required!');
        return false;
    }
    //Otherwise, send the post request.
    helper.sendPost(e.target.action, { name, avatar }, reloadProfilesFromServer);
    return false;
};

//This handles selecting the avatar for the given profile.
const AvatarSelect = ({ avatars}) => {
    //Use the useState hook to manage the selected avatar.
    let [selectedAvatar, setSelectedAvatar] = useState(`${avatars[0]}`);

    return (
        <div className="avatar-select">
            <h3>Select Your Avatar</h3>
            
            <div className="avatar-grid">
                {avatars.map((avatar, index) => (
                    <label key={index} className={`avatar-option`}>
                        <input
                            type="radio"
                            name="avatar"
                            value={avatar}
                            checked={selectedAvatar === avatar}
                            onChange={(e) => setSelectedAvatar(e.target.value)}
                        />
                        <img src={avatar} alt={`Avatar ${index + 1}`} />
                    </label>
                ))}
            </div>
        </div>
    );
};


/**
 * This react component creates the form for creating a new profile.
 * @returns 
 */
const createProfileForm = () => {
   
    const avatars = [
        '/assets/img/netflix-avatar.png',
        '/assets/img/netflix-avatar_green.png',
        '/assets/img/netflix-avatar_orange.png',
        '/assets/img/netflix-avatar_purple.png',
        '/assets/img/netflix-avatar_red.png',
        '/assets/img/netflix-avatar_yellow.png',
        
        // Add more avatars as needed
    ];
    return <div>
        <h2>Create New Profile</h2>
        <form id="createProfileForm" onSubmit={handleProfileCreation} action='/createProfile' method="POST">
            
            <AvatarSelect avatars={avatars}/>
            

            <label htmlFor='profileName'><h3>Name: </h3> </label>
            <input id="profileName" type="text" name="profileName" placeholder="Name" />
            <input className="formSubmit" type="submit" value="Create Profile" />
            <h3 className = "warning hidden"><span className = "errorMessage"></span></h3>
        </form>
    </div>
};
/**
 * This react component creates the profile buttons for the profiles page.
 * @param {*} props 
 * @returns 
 */
const Profiles = (props) => {

    //Render the UI for each profile.
    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return(<button onClick={(e) => { e.preventDefault(); helper.handleLoadProfile(profile.name); }} className='profile' >

                < img src={profile.avatar} alt='avatar' className='avatar' />
                <h2 className='name' >{profile.name}</h2>
            </button>);
        });
        return (
            <div className="profiles">
                <h1>Who's Watching?</h1>
                <div id="profileRow">
                    {profileNodes}
                </div>
                <a id="manageProfilesButton" href="/manageProfiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<ManageProfiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Manage Profiles</a>
            </div>
        );
    }
    //Return a simple message if the account has no profiles.
    else {
        return (
            <div className="profiles">
                <h1>No Profiles Yet</h1>
                <a id="manageProfilesButton" href="/manageProfiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<ManageProfiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Manage Profiles</a>
            </div>
        );

    }

};
/**
 * This react component creates the buttons for managing existing profiles.
 * @param {*} props 
 * @returns 
 */
const ManageProfiles = (props) => {
    //Display the Editing UI for each profile.
    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return(
                <button className='manageProfile'>
                    <div className='manageAvatar' style={{backgroundImage: `url(${profile.avatar})`}}>
                        <img src="/assets/img/pencil.png" className="pencil-icon" />
                    </div>
                    <h2 className='name' >{profile.name}</h2></button>);
            
        });

        return (
            <div className="profiles">
                <h1>Manage Profiles:</h1>
                <div id="profileRow">
                    {profileNodes}
                </div>
                
                {(props.premium && props.profiles.length < 10) || (!props.premium && props.profiles.length < 5) ? 
                createProfileForm() : <h3>Maximum Profile Count Reached</h3>} 
                <a id="doneButton" href="/profiles" onClick={(e) => {
                    e.preventDefault();

                    ReactDOM.render(<Profiles profiles={props.profiles} />, document.querySelector("#profileContent"));
                }}>Done</a>
            </div>
        );
    }
    //Return a simple message if the account has no profiles to manage.
    else {
        return (
            <div className="profiles">
                <h1>No Profiles Yet</h1>

                {createProfileForm()}
                
                <a id="doneButton" href="/profiles" onClick={(e) => {
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
        <Profiles profiles={data.profiles} preimumStatus={data.premium}/>, document.querySelector("#profileContent")
    );
};

window.onload = init;