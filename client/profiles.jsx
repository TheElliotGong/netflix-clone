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

    const name = e.target.querySelector('#profileName').value;
    console.log(name);
    if (!name) {
        // helper.handleError('Name is required!');
        return false;
    }

    helper.sendPost(e.target.action, { name }, reloadProfilesFromServer);


    return false;
};



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
            return <button onClick={(e)=>{e.preventDefault();helper.handleLoadProfile(profile.name);}} className='profile' >
                < img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' />
                <h2 id='profileName' >{profile.name}</h2>
            </button>
        });
        return (
            <div className="profiles">
                <h1>Who's Watching?</h1>
                <div id="profileRow">
                    {profileNodes}
                </div>
                <a id = "manageProfilesButton" href="/manageProfiles" onClick={(e) => {
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
                <a id = "manageProfilesButton" href="/manageProfiles" onClick={(e) => {
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
                <button className = 'manageProfile'>< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h2 className='name' >{profile.name}</h2>
            </div>
        });

        return (
            <div className="profiles">
                <h1>Manage Profiles:</h1>
                <div id="profileRow">
                    {profileNodes}
                </div>

                {createProfileForm()}
                <a id = "doneButton" href="/profiles" onClick={(e) => {
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
                <a id = "doneButton" href="/profiles" onClick={(e) => {
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