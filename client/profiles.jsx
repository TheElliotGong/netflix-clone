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

const getEditProfileForm = () => document.getElementById('editProfileForm');

// Deleting is irreversible, so the dialog swaps its action row for a confirmation
// prompt rather than acting on the first click.
const setDeleteConfirmVisible = (visible) => {
  const editProfileForm = getEditProfileForm();

  if (!editProfileForm) {
    return;
  }

  const actions = editProfileForm.querySelector('.modal__actions');
  const confirmPrompt = editProfileForm.querySelector('#deleteConfirm');

  if (!actions || !confirmPrompt) {
    return;
  }

  actions.classList.toggle('hidden', visible);
  confirmPrompt.classList.toggle('hidden', !visible);
};

const isDeleteConfirmVisible = () => {
  const confirmPrompt = document.getElementById('deleteConfirm');

  return Boolean(confirmPrompt) && !confirmPrompt.classList.contains('hidden');
};

const showEditProfileForm = () => {
  const editProfileForm = getEditProfileForm();

  if (editProfileForm) {
    editProfileForm.classList.add('is-open');
  }
};

const hideEditProfileForm = () => {
  const editProfileForm = getEditProfileForm();

  if (editProfileForm) {
    editProfileForm.classList.remove('is-open');
    setDeleteConfirmVisible(false);
    helper.hideError(editProfileForm);
  }
};

const closeEditProfileForm = () => {
  hideEditProfileForm();
};

// Re-fetches the profiles and re-renders whichever screen the user is on, so a
// create/edit/delete never bounces them to the other screen.
async function reloadProfilesFromServer(screen = 'manage') {
  const response = await fetch('/getProfiles');
  const data = await response.json();

  updatePremiumStatus(data.premium);

  renderAtSelector(
    '#profileContent',
    screen === 'watch'
      ? <Profiles profiles={data.profiles} premiumStatus={data.premium} />
      : <ManageProfiles profiles={data.profiles} premium={data.premium} />,
  );
}

const handleProfileCreation = (e) => {
  e.preventDefault();
  helper.hideError(e.target);

  const nameInput = e.target.querySelector('#profileName');
  const name = nameInput.value.trim();
  const selectedAvatar = e.target.querySelector('input[name="avatar"]:checked');
  const avatar = selectedAvatar ? selectedAvatar.value : avatars[0];

  if (!name) {
    helper.handleError('Name is required!', e.target);
    return false;
  }

  helper.sendPost(
    e.target.action,
    { name, avatar },
    () => {
      nameInput.value = '';
      reloadProfilesFromServer('watch');
    },
    e.target,
  );
  return false;
};

function AvatarSelect({ avatarsList, defaultAvatar }) {
  const [selectedAvatar, setSelectedAvatar] = useState(
    defaultAvatar || avatarsList[0],
  );

  return (
    <div className="avatar-select">
      <h3 className="avatar-select__title">Select your avatar</h3>
      <div className="avatar-grid">
        {avatarsList.map((avatar) => {
          const avatarId = `avatar-${avatar.split('/').pop().replace(/\./g, '-')}`;

          return (
            <label key={avatar} htmlFor={avatarId} className="avatar-option">
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

function ProfileTile({
  profile, variant, label, onSelect,
}) {
  const isManage = variant === 'manage';

  return (
    <li>
      <button
        type="button"
        className={`profile-tile${isManage ? ' profile-tile--manage' : ''}`}
        aria-label={`${label} ${profile.name}`}
        onClick={(e) => {
          e.preventDefault();
          onSelect(profile);
        }}
      >
        <span
          className="profile-tile__art"
          style={isManage ? { backgroundImage: `url(${profile.avatar})` } : undefined}
        >
          {isManage ? (
            <img src="/assets/img/pencil.png" className="profile-tile__edit-icon" alt="" />
          ) : (
            <img src={profile.avatar} className="profile-tile__avatar" alt="" />
          )}
        </span>
        <span className="profile-tile__name">{profile.name}</span>
      </button>
    </li>
  );
}

function ProfileRow({ profiles, variant, onSelect }) {
  return (
    <ul className="profile-row">
      {profiles.map((profile) => (
        <ProfileTile
          key={profile._id || profile.name}
          profile={profile}
          variant={variant}
          label={variant === 'manage' ? 'Edit profile' : 'Watch as'}
          onSelect={onSelect}
        />
      ))}
    </ul>
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
      className="profile-panel"
    >
      <h2 className="panel-title">Create a new profile</h2>
      <label className="field" htmlFor="profileName">
        <span className="field__label">Profile name</span>
        <input
          className="field__input"
          id="profileName"
          type="text"
          name="profileName"
          placeholder="e.g. Living Room"
        />
      </label>
      <AvatarSelect avatarsList={avatars} />
      <p className="warning hidden"><span className="errorMessage" /></p>
      <button className="btn btn--primary btn--block" type="submit">Create profile</button>
    </form>
  );
}

function initEditProfileForm(profile) {
  showEditProfileForm();

  const editProfileForm = getEditProfileForm();
  const profileNameInput = document.getElementById('editProfileName');
  const profileForm = document.getElementById('profileForm');

  helper.hideError(editProfileForm);

  if (profileNameInput) {
    profileNameInput.value = profile.name;
    // Move focus into the dialog so keyboard users land on the first field.
    profileNameInput.focus();
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
      helper.hideError(editProfileForm);

      const newName = e.target.querySelector('#editProfileName').value.trim();
      const selectedAvatar = e.target.querySelector('input[name="avatar"]:checked');
      const avatar = selectedAvatar ? selectedAvatar.value : profile.avatar;

      if (!newName) {
        helper.handleError('Name is required!', editProfileForm);
        return false;
      }

      helper.sendPost(
        e.target.action,
        {
          name: profileForm.dataset.originalName,
          newName,
          avatar,
        },
        () => {
          closeEditProfileForm();
          reloadProfilesFromServer();
        },
        editProfileForm,
      );

      return false;
    };
  }

  const deleteProfileButton = document.querySelector('#deleteProfile');
  const closeFormButton = document.querySelector('#closeForm');
  const cancelDeleteButton = document.querySelector('#cancelDelete');
  const confirmDeleteButton = document.querySelector('#confirmDelete');
  const deleteConfirmName = document.querySelector('#deleteConfirmName');

  setDeleteConfirmVisible(false);

  if (deleteConfirmName) {
    deleteConfirmName.textContent = profile.name;
  }

  if (deleteProfileButton) {
    // First click only asks; #confirmDelete is what actually deletes.
    deleteProfileButton.onclick = (e) => {
      e.preventDefault();
      helper.hideError(editProfileForm);
      setDeleteConfirmVisible(true);

      if (cancelDeleteButton) {
        cancelDeleteButton.focus();
      }
    };
  }

  if (cancelDeleteButton) {
    cancelDeleteButton.onclick = (e) => {
      e.preventDefault();
      setDeleteConfirmVisible(false);

      if (deleteProfileButton) {
        deleteProfileButton.focus();
      }
    };
  }

  if (confirmDeleteButton) {
    confirmDeleteButton.onclick = (e) => {
      e.preventDefault();
      helper.sendPost(
        '/removeProfile',
        { name: profile.name },
        () => {
          closeEditProfileForm();
          reloadProfilesFromServer();
        },
        editProfileForm,
      );
    };
  }

  if (closeFormButton) {
    closeFormButton.onclick = (e) => {
      e.preventDefault();
      closeEditProfileForm();
    };
  }
}

function Profiles({ profiles, premiumStatus }) {
  const hasProfiles = profiles.length > 0;
  const limitReached = !canCreateProfile(profiles);

  return (
    <div className="profile-screen">
      <header className="screen-header">
        <h1 className="screen-title">{hasProfiles ? "Who's watching?" : 'No profiles yet'}</h1>
        <p className="screen-subtitle">
          {hasProfiles
            ? 'Pick a profile to start watching.'
            : 'Create your first profile to start watching.'}
        </p>
      </header>

      {hasProfiles && (
        <ProfileRow
          profiles={profiles}
          variant="watch"
          onSelect={(profile) => helper.handleLoadProfile(profile.name)}
        />
      )}

      {limitReached ? (
        <p className="notice">
          {`You've reached the maximum of ${MAX_PROFILES} profiles.`}
        </p>
      ) : (
        <CreateProfileForm />
      )}

      {hasProfiles && (
        <div className="screen-actions">
          <a
            className="btn btn--ghost"
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
            Manage profiles
          </a>
        </div>
      )}
    </div>
  );
}

function ManageProfiles({ profiles, premium }) {
  const hasProfiles = profiles.length > 0;

  return (
    <div className="profile-screen">
      <header className="screen-header">
        <h1 className="screen-title">Manage profiles</h1>
        <p className="screen-subtitle">Select a profile to rename it, change its avatar, or delete it.</p>
      </header>

      {hasProfiles ? (
        <ProfileRow
          profiles={profiles}
          variant="manage"
          onSelect={initEditProfileForm}
        />
      ) : (
        <p className="empty-state">No profiles available to manage.</p>
      )}

      <div className="screen-actions">
        <a
          className="btn btn--secondary"
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
    </div>
  );
}

const init = async () => {
  const response = await fetch('/getProfiles');
  const data = await response.json();

  updatePremiumStatus(data.premium);
  hideEditProfileForm();

  const editProfileForm = getEditProfileForm();

  // Dismissing backs out of a pending delete first, so the confirmation can never
  // be skipped past by an stray click or keypress.
  const dismiss = () => {
    if (isDeleteConfirmVisible()) {
      setDeleteConfirmVisible(false);
      return;
    }

    closeEditProfileForm();
  };

  if (editProfileForm) {
    // Dismiss the dialog by clicking the backdrop, but not the dialog itself.
    editProfileForm.addEventListener('click', (e) => {
      if (e.target === editProfileForm) {
        dismiss();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismiss();
    }
  });

  renderAtSelector(
    '#profileContent',
    <Profiles profiles={data.profiles} premiumStatus={data.premium} />,
  );
};

const profileShape = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
});

AvatarSelect.propTypes = {
  avatarsList: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultAvatar: PropTypes.string,
};

AvatarSelect.defaultProps = {
  defaultAvatar: null,
};

ProfileTile.propTypes = {
  profile: profileShape.isRequired,
  variant: PropTypes.oneOf(['watch', 'manage']).isRequired,
  label: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

ProfileRow.propTypes = {
  profiles: PropTypes.arrayOf(profileShape).isRequired,
  variant: PropTypes.oneOf(['watch', 'manage']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

Profiles.propTypes = {
  profiles: PropTypes.arrayOf(profileShape).isRequired,
  premiumStatus: PropTypes.bool,
};

Profiles.defaultProps = {
  premiumStatus: false,
};

ManageProfiles.propTypes = {
  profiles: PropTypes.arrayOf(profileShape).isRequired,
  premium: PropTypes.bool,
};

ManageProfiles.defaultProps = {
  premium: false,
};

window.onload = init;
