const React = require('react');
const Popup = require('reactjs-popup').default;

const { useState } = React;
const ReactDOMClient = require('react-dom/client');
const PropTypes = require('prop-types'); // eslint-disable-line import/no-extraneous-dependencies
const helper = require('./helper.js');

const roots = {};

const renderAtSelector = (selector, component) => {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  if (!roots[selector]) {
    roots[selector] = ReactDOMClient.createRoot(container);
  }

  roots[selector].render(component);
};

const avatars = [
  '/assets/img/netflix-avatar.png',
  '/assets/img/netflix-avatar_green.png',
  '/assets/img/netflix-avatar_orange.png',
  '/assets/img/netflix-avatar_purple.png',
  '/assets/img/netflix-avatar_red.png',
  '/assets/img/netflix-avatar_yellow.png',

  // Add more avatars as needed
];
/**
 * This form only runs when creating a new profile.
 * It should update the manage profiles page on completion.
 * @param {*} e
 * @returns
 */
const handleProfileCreation = (e) => {
  e.preventDefault();
  helper.hideError();
  const name = e.target.querySelector('#profileName').value;
  const avatar = e.target.querySelector('input[name="avatar"]:checked').value;
  // Check for errors.
  if (!name) {
    helper.handleError('Name is required!');
    return false;
  }
  // Otherwise, send the post request.
  // eslint-disable-next-line no-use-before-define
  helper.sendPost(e.target.action, { name, avatar }, reloadProfilesFromServer);
  return false;
};

function AvatarSelect({ avatarsList, defaultAvatar }) {
  // Use the useState hook to manage the selected avatar.
  const [selectedAvatar, setSelectedAvatar] = useState(
    defaultAvatar || avatarsList[0],
  );

  return (
    <div className="avatar-select">
      <h3>Select Your Avatar</h3>
      <div className="avatar-grid">
        {avatarsList.map((avatar) => (
          <label
            key={avatar}
            htmlFor={`avatar-${avatar.split('/').pop().replace(/\./g, '-')}`}
            className={`avatar-option ${
              selectedAvatar === avatar ? 'selected' : ''
            }`}
          >
            <input
              id={`avatar-${avatar.split('/').pop().replace(/\./g, '-')}`}
              type="radio"
              name="avatar"
              value={avatar}
              checked={selectedAvatar === avatar}
              onChange={(e) => setSelectedAvatar(e.target.value)}
            />
            <img src={avatar} alt="Profile avatar option" />
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * This react component creates the form for creating a new profile.
 * @returns
 */
const createProfileForm = () => (
  <div>
    <h2>Create New Profile</h2>
    <form
      id="createProfileForm"
      onSubmit={handleProfileCreation}
      action="/createProfile"
      method="POST"
    >
      <AvatarSelect avatarsList={avatars} />
      <label htmlFor="profileName">
        <h3>Name: </h3>
        {' '}
      </label>
      <input
        id="profileName"
        type="text"
        name="profileName"
        placeholder="Name"
      />
      <input className="formSubmit" type="submit" value="Create Profile" />
      <h3 className="warning hidden">
        <span className="errorMessage" />
      </h3>
    </form>
  </div>
);

/**
 * This react component creates the profile buttons for the profiles page.
 * @param {*} props
 * @returns
 */
function Profiles({ profiles, premiumStatus }) {
  // Render the UI for each profile.
  if (profiles.length > 0) {
    const profileNodes = profiles.map((profile) => (
      <button
        type="button"
        key={profile._id || profile.name}
        onClick={(e) => {
          e.preventDefault();
          helper.handleLoadProfile(profile.name);
        }}
        className="profile"
      >
        <img src={profile.avatar} alt="avatar" className="avatar" />
        <h2 className="name">{profile.name}</h2>
      </button>
    ));
    return (
      <div className="profiles">
        <h1>Who&apos;s Watching?</h1>
        <div id="profileRow">{profileNodes}</div>
        <a
          id="manageProfilesButton"
          href="/manageProfiles"
          onClick={(e) => {
            e.preventDefault();

            renderAtSelector(
              '#profileContent',
              <ManageProfiles profiles={profiles} premium={premiumStatus} />,
            );
          }}
        >
          Manage Profiles
        </a>
        <Popup trigger={<button type="button" className="button"> Open Modal </button>} modal>
          <span> Modal content </span>
        </Popup>
      </div>
    );
  }
  // Return a simple message if the account has no profiles.

  return (
    <div className="profiles">
      <h1>No Profiles Yet</h1>
      <a
        id="manageProfilesButton"
        href="/manageProfiles"
        onClick={(e) => {
          e.preventDefault();

          renderAtSelector(
            '#profileContent',
            <ManageProfiles profiles={profiles} premium={premiumStatus} />,
          );
        }}
      >
        Manage Profiles
      </a>
      <Popup trigger={<button type="button" className="button">Manage Profiles</button>} modal nested>
        {(close) => (
          <div className="modal">
            <button type="button" className="close" onClick={close}>
              &times;
            </button>
            <div className="header">Manage Profiles</div>
            <div className="content">
              {/* Add your content here */}
              <p>This is a simple popup with a close button and a title.</p>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
/**
 * This react component creates the buttons for managing existing profiles.
 * @param {*} props
 * @returns
 */
function ManageProfiles({ profiles, premium }) {
  // Display the Editing UI for each profile.
  if (profiles.length > 0) {
    const profileNodes = profiles.map((profile) => (
      <button
        type="button"
        key={profile._id || profile.name}
        className="manageProfile"
        onClick={(e) => {
          e.preventDefault();
          // eslint-disable-next-line no-use-before-define
          initEditProfileForm(profile);
        }}
      >
        <div
          className="manageAvatar"
          style={{ backgroundImage: `url(${profile.avatar})` }}
        >
          <img src="/assets/img/pencil.png" className="pencil-icon" alt="Edit profile" />
        </div>
        <h2 className="name">{profile.name}</h2>
      </button>
    ));

    return (
      <div className="profiles">
        <h1>Manage Profiles:</h1>
        <div id="profileRow">{profileNodes}</div>

        {(premium && profiles.length < 10)
        || (!premium && profiles.length < 5) ? (
            createProfileForm()
          ) : (
            <h3>Maximum Profile Count Reached</h3>
          )}
        <a
          id="doneButton"
          href="/profiles"
          onClick={(e) => {
            e.preventDefault();

            renderAtSelector(
              '#profileContent',
              <Profiles profiles={profiles} premiumStatus={premium} />,
            );
          }}
        >
          Done
        </a>
      </div>
    );
  }
  // Return a simple message if the account has no profiles to manage.

  return (
    <div className="profiles">
      <h1>No Profiles Yet</h1>

      {createProfileForm()}

      <a
        id="doneButton"
        href="/profiles"
        onClick={(e) => {
          e.preventDefault();

          renderAtSelector(
            '#profileContent',
            <Profiles profiles={profiles} premiumStatus={premium} />,
          );
        }}
      >
        Done
      </a>
    </div>
  );
}

const reloadProfilesFromServer = async () => {
  const response = await fetch('/getProfiles');
  const data = await response.json();
  // Render the domos under the selected html element.
  renderAtSelector(
    '#profileContent',
    <ManageProfiles profiles={data.profiles} premium={data.premium} />,
  );
};

function closeEditProfileForm() {
  document.querySelector('.modal-content').style.display = 'none';
}

function initEditProfileForm(profile) {
  document.querySelector('.modal-content').style.display = 'block';
  document.getElementById('profileName').value = profile.name;
  document.getElementById('profileAvatar').value = profile.avatar;
  document.querySelector('#profileAvatar').innerHTML = `${(
    <AvatarSelect avatarsList={avatars} defaultAvatar={profile.avatar} />
  )}`;
  document.getElementById('editProfileForm').onsubmit = (e) => {
    e.preventDefault();
    helper.hideError();
    const name = e.target.querySelector('#profileName').value;
    const avatar = e.target.querySelector('input[name="avatar"]:checked').value;

    // Check for errors.
    if (!name) {
      helper.handleError('Name is required!');
      return false;
    }
    // Otherwise, send the post request.
    helper.sendPost(
      e.target.action,
      { name, avatar },
      reloadProfilesFromServer,
    );
    return false;
  };
  // Set up the delete profile button.
  document.querySelector('#deleteProfile').onClick = (e) => {
    e.preventDefault();
    helper.sendPost(
      '/removeProfile',
      { name: profile.name },
      reloadProfilesFromServer,
    );
    closeEditProfileForm();
  };
  document.querySelector('#closeForm').onClick = (e) => {
    e.preventDefault();
    closeEditProfileForm();
  };
}

const init = async () => {
  const response = await fetch('/getProfiles');
  const data = await response.json();
  // Render the domos under the selected html element.
  renderAtSelector(
    '#profileContent',
    <Profiles profiles={data.profiles} premiumStatus={data.premium} />,
  );
};

AvatarSelect.propTypes = {
  avatarsList: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultAvatar: PropTypes.string,
};

AvatarSelect.defaultProps = {
  defaultAvatar: null,
};

Profiles.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }),
  ).isRequired,
  premiumStatus: PropTypes.bool,
};

Profiles.defaultProps = {
  premiumStatus: false,
};

ManageProfiles.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }),
  ).isRequired,
  premium: PropTypes.bool,
};

ManageProfiles.defaultProps = {
  premium: false,
};

window.onload = init;
