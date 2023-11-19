const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const useState = React.useState;

const handleProfile = (e) => {
    e.preventDefault();
    helper.hideError();

    const profileName = e.target.querySelector('#name').value;
    if (!profileName) {
        helper.handleError('Profile Name is required.');
        return false;
    }
    helper.sendPost(e.target.action, { profileName });
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

const Profiles = (props) => {
    if(props.profiles.length > 0)
    {
        const profileNodes = props.profiles.map(profile => {
            return <div key={profile._id} className='profile'>
                <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h3 className='profileName' >Name: {profile.name}</h3>
            </div>
        });
        return (
            <div className="profileList">
                {profileNodes}
                <a href="/manageProfiles" onClick={handleClick}>Manage Profiles</a>
            </div>
        );
    }
    else
    {
        return (
            <div className="profileList">
                <h2>No profiles yet</h2>
                <a href="/manageProfiles" onClick={(e)=>{e.preventDefault();console.log('Test');}}>Manage Profiles</a>
            </div>
        );
    
    }

};

const ManageProfiles = (props) => {
    if(props.profiles.length > 0)
    {
        const profileNodes = props.profiles.map(profile => {
            return <div key={profile._id} className='profile'>
                <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h3 className='profileName' >Name: {profile.name}</h3>
            </div>
        });
        return (
            <div className="profileList">
                {profileNodes}
                {createProfileForm()}
                <a href="/profiles" onClick={handleClick}>Done</a>
            </div>
        );
    }
    else
    {
        return (
            <div className="profileList">
                <h2>No profiles yet</h2>
                {createProfileForm()}
                <a href="/profiles" onClick={handleClick}>Done</a>
            </div>
        );
    
    }
};

const ManageProfileList = (props) => {
    const [view, setView] = useState('manage');

    const handleClick = (e) => {
        e.preventDefault();
        setView('profileList');
    };

    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return <div key={profile._id} className='profile'>
                <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h3 className='profileName' >Name: {profile.name}</h3>
            </div>
        });

        if (view === 'manage') {
            return (
                <div className="profileList">
                    {profileNodes}
                    {createProfileForm()}
                    <a href="/profiles" onClick={handleClick}>Done</a>
                </div>
            );
        } else if (view === 'profileList') {
            return <ProfileList profiles={props.profiles} />;
        }
    }
    else
    {
        return (
            <div className="profileList">
                <h2>No profiles yet</h2>
                {createProfileForm()}
                <a href="/profiles" onClick={handleClick}>Done</a>
            </div>
        );
    
    }
};
/**
 * This function creates the list of profiles under the logged in account.
 * @param {*} props 
 * @returns 
 */
const ProfileList = (props) => {
    const [view, setView] = useState('profileList');

    const handleClick = (e) => {
        e.preventDefault();
        setView('manage');
    };

    if (props.profiles.length > 0) {
        const profileNodes = props.profiles.map(profile => {
            return <div key={profile._id} className='profile'>
                <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
                <h3 className='profileName' >Name: {profile.name}</h3>
            </div>
        });

        if (view === 'profileList') {
            return (
                <div className="profileList">
                    {profileNodes}
                    <a href="/profiles" onClick={handleClick}>Manage Profiles</a>
                </div>
            );
        } else if (view === 'manage') {
            return <ManageProfileList profiles={props.profiles} />;
        }
    }
    else
    {
        return (
            <div className="profileList">
                <h2>No profiles yet</h2>
                <a href="/manageProfiles" onClick={handleClick}>Manage Profiles</a>
            </div>
        );
    }

};
const loadProfilesFromServer = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();

    //Render the domos under the selected html element.
    ReactDOM.render(
        <Profiles profiles={data.profiles} />, document.querySelector("#accountProfiles")
    );
};

const loadProfile = (e) => {
    const profileName = e.target.value;
};


window.onload = loadProfilesFromServer;