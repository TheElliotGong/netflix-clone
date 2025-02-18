const helper = require("./helper.js");
const React = require("react");
const Popup = require("reactjs-popup").default;
const { useState } = React;
const ReactDOM = require("react-dom");
const avatars = [
  "/assets/img/netflix-avatar.png",
  "/assets/img/netflix-avatar_green.png",
  "/assets/img/netflix-avatar_orange.png",
  "/assets/img/netflix-avatar_purple.png",
  "/assets/img/netflix-avatar_red.png",
  "/assets/img/netflix-avatar_yellow.png",

  // Add more avatars as needed
];
/**
 * This form only runs when creating a new profile, which should update the manage profiles page on completion.
 * @param {*} e
 * @returns
 */
const handleProfileCreation = (e) => {
  e.preventDefault();
  helper.hideError();
  const name = e.target.querySelector("#profileName").value;
  const avatar = e.target.querySelector('input[name="avatar"]:checked').value;
  console.log(avatar);
  //Check for errors.
  if (!name) {
    helper.handleError("Name is required!");
    return false;
  }
  //Otherwise, send the post request.
  helper.sendPost(e.target.action, { name, avatar }, reloadProfilesFromServer);
  return false;
};

const AvatarSelect = ({ avatars, defaultAvatar }) => {
  // Use the useState hook to manage the selected avatar.
  const [selectedAvatar, setSelectedAvatar] = useState(
    defaultAvatar || avatars[0]
  );

  return (
    <div className="avatar-select">
      <h3>Select Your Avatar</h3>
      <div className="avatar-grid">
        {avatars.map((avatar, index) => (
          <label
            key={index}
            className={`avatar-option ${
              selectedAvatar === avatar ? "selected" : ""
            }`}
          >
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
  return (
    <div>
      <h2>Create New Profile</h2>
      <form
        id="createProfileForm"
        onSubmit={handleProfileCreation}
        action="/createProfile"
        method="POST"
      >
        <AvatarSelect avatars={avatars} />
        <label htmlFor="profileName">
          <h3>Name: </h3>{" "}
        </label>
        <input
          id="profileName"
          type="text"
          name="profileName"
          placeholder="Name"
        />
        <input className="formSubmit" type="submit" value="Create Profile" />
        <h3 className="warning hidden">
          <span className="errorMessage"></span>
        </h3>
      </form>
    </div>
  );
};



/**
 * This react component creates the profile buttons for the profiles page.
 * @param {*} props
 * @returns
 */
const Profiles = (props) => {
  //Render the UI for each profile.
  if (props.profiles.length > 0) {
    const profileNodes = props.profiles.map((profile) => {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            helper.handleLoadProfile(profile.name);
          }}
          className="profile"
        >
          <img src={profile.avatar} alt="avatar" className="avatar" />
          <h2 className="name">{profile.name}</h2>
        </button>
      );
    });
    return (
      <div className="profiles">
        <h1>Who's Watching?</h1>
        <div id="profileRow">{profileNodes}</div>
        <a
          id="manageProfilesButton"
          href="/manageProfiles"
          onClick={(e) => {
            e.preventDefault();

            ReactDOM.render(
              <ManageProfiles profiles={props.profiles} />,
              document.querySelector("#profileContent")
            );
          }}
        >
          Manage Profiles
        </a>
        {/* <Popup trigger={<button className="button"> Open Modal </button>} modal>
    <span> Modal content </span>
  </Popup> */}
      </div>
    );
  }
  //Return a simple message if the account has no profiles.
  else {
    return (
      <div className="profiles">
        <h1>No Profiles Yet</h1>
        <a
          id="manageProfilesButton"
          href="/manageProfiles"
          onClick={(e) => {
            e.preventDefault();

            ReactDOM.render(
              <ManageProfiles profiles={props.profiles} />,
              document.querySelector("#profileContent")
            );
          }}
        >
          Manage Profiles
        </a>
        <Popup trigger={<button className="button">Manage Profiles</button>} modal nested>
        {close => (
          <div className="modal">
            <button className="close" onClick={close}>
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
};
/**
 * This react component creates the buttons for managing existing profiles.
 * @param {*} props
 * @returns
 */
const ManageProfiles = (props) => {
  //Display the Editing UI for each profile.
  if (props.profiles.length > 0) {
    const profileNodes = props.profiles.map((profile) => {
      return (
        <button
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
            <img src="/assets/img/pencil.png" className="pencil-icon" />
          </div>
          <h2 className="name">{profile.name}</h2>
        </button>
      );
    });

    return (
      <div className="profiles">
        <h1>Manage Profiles:</h1>
        <div id="profileRow">{profileNodes}</div>

        {(props.premium && props.profiles.length < 10) ||
        (!props.premium && props.profiles.length < 5) ? (
          createProfileForm()
        ) : (
          <h3>Maximum Profile Count Reached</h3>
        )}
        <a
          id="doneButton"
          href="/profiles"
          onClick={(e) => {
            e.preventDefault();

            ReactDOM.render(
              <Profiles profiles={props.profiles} />,
              document.querySelector("#profileContent")
            );
          }}
        >
          Done
        </a>
      </div>
    );
  }
  //Return a simple message if the account has no profiles to manage.
  else {
    return (
      <div className="profiles">
        <h1>No Profiles Yet</h1>

        {createProfileForm()}

        <a
          id="doneButton"
          href="/profiles"
          onClick={(e) => {
            e.preventDefault();

            ReactDOM.render(
              <Profiles profiles={props.profiles} />,
              document.querySelector("#profileContent")
            );
          }}
        >
          Done
        </a>
      </div>
    );
  }
};

const reloadProfilesFromServer = async () => {
  const response = await fetch("/getProfiles");
  const data = await response.json();
  //Render the domos under the selected html element.
  ReactDOM.render(
    <ManageProfiles profiles={data.profiles} />,
    document.querySelector("#profileContent")
  );
};

const closeEditProfileForm = () => {
  document.querySelector(".modal-content").style.display = "none";
};
const initEditProfileForm = (profile) => {
  document.querySelector(".modal-content").style.display = "block";
  document.getElementById("profileName").value = profile.name;
  document.getElementById("profileAvatar").value = profile.avatar;
  document.querySelector("#profileAvatar").innerHTML = `${(
    <AvatarSelect avatars={avatars} defaultAvatar={profile.avatar} />
  )}`;
  document.getElementById("editProfileForm").onsubmit = (e) => {
    e.preventDefault();
    helper.hideError();
    const name = e.target.querySelector("#profileName").value;
    const avatar = e.target.querySelector('input[name="avatar"]:checked').value;

    //Check for errors.
    if (!name) {
      helper.handleError("Name is required!");
      return false;
    }
    //Otherwise, send the post request.
    helper.sendPost(
      e.target.action,
      { name, avatar },
      reloadProfilesFromServer
    );
    return false;
  };
  //Set up the delete profile button.
  document.querySelector("#deleteProfile").onClick = (e) => {
    e.preventDefault();
    helper.sendPost(
      "/removeProfile",
      { name: profile.name },
      reloadProfilesFromServer
    );
    closeEditProfileForm();
  };
  document.querySelector("#closeForm").onClick = (e) => {
    e.preventDefault();
    closeEditProfileForm();
  };
};

const init = async () => {
  const response = await fetch("/getProfiles");
  const data = await response.json();
  //Render the domos under the selected html element.
  ReactDOM.render(
    <Profiles profiles={data.profiles} preimumStatus={data.premium} />,
    document.querySelector("#profileContent")
  );
};

window.onload = init;
