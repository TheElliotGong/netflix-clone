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
    helper.hideError();
    const name = e.target.querySelector('#profileName').value;
    if (!name) {
        helper.handleError('Name is required!');
        return false;
    }
    helper.sendPost(e.target.action, { name }, reloadProfilesFromServer);
    return false;
};


/**
 * This react component creates the form for creating a new profile.
 * @returns 
 */
const createProfileForm = () => {
    return <div>
        <form id="createProfileForm" onSubmit={handleProfileCreation} action='/createProfile' method="POST">
            <label htmlFor='profileName'>Name: </label>
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

                < img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' />
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

    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return(
                <button className='manageProfile'>
                    <div className='manageAvatar'>
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

                {createProfileForm()}
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
        <Profiles profiles={data.profiles} />, document.querySelector("#profileContent")
    );
};




window.onload = init;