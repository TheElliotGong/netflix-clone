const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const ProfileList = (props) => {
    //Check if domos exist.
    if(props.profiles.length === 0)
    {
        return(
            <div className="profileList">
                <h3 className="emptyProfile">No Profiles yet</h3>
            </div>
        );
    }
    //Otherwise, create html elements from each domo object.
    const profileNodes = props.profiles.map(profile => {
        return <div key={profile._id} className='profile'>
           < img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' />
              <h3 className='profileName'>Name: {profile.name}</h3>

        </div>
    })
    //Return the domo list.
    return(
        <div className="profileList">
            {profileNodes}
        </div>
    );
};
const loadProfilesFromServer = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();
    //Render the domos under the selected html element.
    ReactDOM.render(
        <ProfileList profiles={data.profiles} />, document.querySelector("#currentProfiles")
    );
};


const init = () => {

    ReactDOM.render(
        <ProfileList profiles={[]} />, document.querySelector("#currentProfiles")
    );

    loadProfilesFromServer();
};

window.onload = init;