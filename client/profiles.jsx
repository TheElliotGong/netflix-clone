const React = require('react');
const ReactDOMClient = require('react-dom/client');
const PropTypes = require('prop-types'); // eslint-disable-line import/no-extraneous-dependencies
const helper = require('./helper.js');

const { useState } = React;

const roots = {};
let currentPremiumStatus = false;

const avatars = [
  '/assets/img/netflix-avatar.png',
  '/assets/img/netflix-avatar_green.png',
  '/assets/img/netflix-avatar_orange.png',
  '/assets/img/netflix-avatar_purple.png',
  '/assets/img/netflix-avatar_red.png',
  '/assets/img/netflix-avatar_yellow.png',
];

const MAX_PROFILES = 5;

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

const updatePremiumStatus = (premiumStatus) => {
  currentPremiumStatus = Boolean(premiumStatus);
  return currentPremiumStatus;
};

const canCreateProfile = (profiles = []) => profiles.length < MAX_PROFILES;

const showEditProfileForm = () => {
  const editProfileForm = document.getElementById('editProfileForm');

  if (editProfileForm) {
    editProfileForm.style.display = 'block';
  }
};

const hideEditProfileForm = () => {
  const editProfileForm = document.getElementById('editProfileForm');

  if (editProfileForm) {
    editProfileForm.style.display = 'none';
  }
};

const closeEditProfileForm = () => {
  hideEditProfileForm();
};

async function reloadProfilesFromServer() {
  const response = await fetch('/getProfiles');
  const data = await response.json();

  updatePremiumStatus(data.premium);

  renderAtSelector(
    '#profileContent',
    <ManageProfiles profiles={data.profiles} premium={data.premium} />,
  );
}

const handleProfileCreation = (e) => {
  e.preventDefault();
  helper.hideError();

  const name = e.target.querySelector('#profileName').value.trim();
  const selectedAvatar = e.target.querySelector('input[name="avatar"]:checked');
  const avatar = selectedAvatar ? selectedAvatar.value : avatars[0];

  if (!name) {
    helper.handleError('Name is required!');
    return false;
  }

  helper.sendPost(e.target.action, { name, avatar }, reloadProfilesFromServer);
  return false;
};

function AvatarSelect({ avatarsList, defaultAvatar }) {
  const [selectedAvatar, setSelectedAvatar] = useState(
    defaultAvatar || avatarsList[0],
  );

  return (
    <div className="avatar-select">
      <h3>Select Your Avatar</h3>
      <div className="avatar-grid">
        {avatarsList.map((avatar) => {
          const avatarId = `avatar-${avatar.split('/').pop().replace(/\./g, '-')}`;

          return (
            <label
              key={avatar}
              htmlFor={avatarId}
              className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
            >
              <input
                id={avatarId}
                type="radio"
                name="avatar"
                value={avatar}
                checked={selectedAvatar === avatar}
                onChange={(event) => setSelectedAvatar(event.target.value)}
              />
              <img src={avatar} alt="Profile avatar option" />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function CreateProfileForm() {
  return (
    <form
      id="createProfileForm"
      name="createProfileForm"
      onSubmit={handleProfileCreation}
      action="/createProfile"
      method="POST"
      className="mainForm"
    >
      <h2>Create New Profile</h2>
      <label htmlFor="profileName">
        Profile Name:
        <input id="profileName" type="text" name="profileName" placeholder="Profile name" />
      </label>
      <AvatarSelect avatarsList={avatars} />
      <input className="formSubmit" type="submit" value="Create Profile" />
      <h3 className="warning hidden"><span className="errorMessage" /></h3>
    </form>
  );
}

function initEditProfileForm(profile) {
  showEditProfileForm();

  const profileNameInput = document.getElementById('profileName');
  const profileForm = document.getElementById('profileForm');

  if (profileNameInput) {
    profileNameInput.value = profile.name;
  }

  if (profileForm) {
    profileForm.dataset.originalName = profile.name;
  }

  renderAtSelector(
    '#profileAvatar',
    <AvatarSelect avatarsList={avatars} defaultAvatar={profile.avatar} />,
  );

  if (profileForm) {
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      helper.hideError();

      const newName = e.target.querySelector('#profileName').value.trim();
      const selectedAvatar = e.target.querySelector('input[name="avatar"]:checked');
      const avatar = selectedAvatar ? selectedAvatar.value : profile.avatar;

      if (!newName) {
        helper.handleError('Name is required!');
        return false;
      }

      helper.sendPost(
        e.target.action,
        {
          name: profileForm.dataset.originalName,
          newName,
          avatar,
        },
        reloadProfilesFromServer,
      );

      return false;
    };
  }

  const deleteProfileButton = document.querySelector('#deleteProfile');
  const closeFormButton = document.querySelector('#closeForm');
  const saveProfileButton = document.querySelector('#saveProfile');

  if (deleteProfileButton) {
    deleteProfileButton.onclick = (e) => {
      e.preventDefault();
      helper.sendPost(
        '/removeProfile',
        { name: profile.name },
        reloadProfilesFromServer,
      );
      closeEditProfileForm();
    };
  }

  if (closeFormButton) {
    closeFormButton.onclick = (e) => {
      e.preventDefault();
      closeEditProfileForm();
    };
  }

  if (saveProfileButton) {
    saveProfileButton.onclick = (e) => {
      e.preventDefault();
      // Handle save profile logic here
      helper.sendPost(
        '/editProfile',
        {
          name: profile.name,
          newName: profileNameInput.value.trim(),
          avatar: document.querySelector('input[name="avatar"]:checked').value,
        },
        reloadProfilesFromServer,
      );
      closeEditProfileForm();
    };
  }
}

function Profiles({ profiles, premiumStatus }) {
  const hasProfiles = profiles.length > 0;
  const limitReached = !canCreateProfile(profiles);

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
      <h1>{hasProfiles ? "Who's Watching?" : 'No Profiles Yet'}</h1>
      {hasProfiles && <div id="profileRow">{profileNodes}</div>}
      {!limitReached ? <CreateProfileForm /> : <h3>Maximum Profile Count Reached</h3>}
      <a
        id="manageProfilesButton"
        href="/manageProfiles"
        onClick={(e) => {
          e.preventDefault();

          hideEditProfileForm();

          renderAtSelector(
            '#profileContent',
            <ManageProfiles profiles={profiles} premium={premiumStatus} />,
          );
        }}
      >
        Manage Profiles
      </a>
    </div>
  );
}

function ManageProfiles({ profiles, premium }) {
  const profileNodes = profiles.map((profile) => (
    <button
      type="button"
      key={profile._id || profile.name}
      className="manageProfile"
      onClick={(e) => {
        e.preventDefault();
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
      {profiles.length > 0 ? <div id="profileRow">{profileNodes}</div> : <p>No profiles available to manage.</p>}
      <a
        id="doneButton"
        href="/profiles"
        onClick={(e) => {
          e.preventDefault();

          hideEditProfileForm();

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

const init = async () => {
  const response = await fetch('/getProfiles');
  const data = await response.json();

  updatePremiumStatus(data.premium);
  hideEditProfileForm();

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
