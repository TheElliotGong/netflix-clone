// import helper files.
const React = require('react');
const ReactDOMClient = require('react-dom/client');
const helper = require('./helper.js');

const { useState, useRef, useEffect } = React;

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
/**
 * Create the change password form
 * @returns
 */
function ChangePasswordWindow() {
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef(null);
  const goBackRef = useRef(null);

  // Land on the safe option when the confirmation appears.
  useEffect(() => {
    if (confirming && goBackRef.current) {
      goBackRef.current.focus();
    }
  }, [confirming]);

  /**
   * Validates the form, then asks for confirmation instead of posting straight away.
   * @param {*} e
   * @returns
   */
  const handlePasswordChange = (e) => {
    e.preventDefault();
    helper.hideError();
    // Get the passwords from the form.
    const currentPass = e.target.querySelector('#currentPass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    // Ensure all fields are filled in and new password is valid.
    if (!currentPass || !pass || !pass2) {
      helper.handleError('All fields are required.');
      return false;
    }
    if (pass !== pass2) {
      helper.handleError('Passwords do not match.');
      return false;
    }
    // A successful change ends the session, so make the user confirm first.
    setConfirming(true);
    return false;
  };

  /**
   * Sends the change the user just confirmed. On success the server redirects to
   * /logout; on failure we drop back to the form so the error is actionable.
   */
  const submitPasswordChange = async () => {
    const form = formRef.current;

    await helper.sendPost(form.action, {
      pass: form.querySelector('#pass').value,
      pass2: form.querySelector('#pass2').value,
      currentPass: form.querySelector('#currentPass').value,
    });

    setConfirming(false);
  };

  return (
    // Create the form.
    <div className="formWindow">
      <h1>Change Password</h1>
      <form
        ref={formRef}
        id="changePasswordForm"
        onSubmit={handlePasswordChange}
        action="/changePassword"
        method="POST"
        className="mainForm"
      >
        <input
          id="currentPass"
          type="password"
          name="currentPass"
          placeholder="Current Password"
        />
        <input
          id="pass"
          type="password"
          name="pass"
          placeholder="New Password"
        />
        <input
          id="pass2"
          type="password"
          name="pass2"
          placeholder="Confirm New Password"
        />
        {confirming ? (
          <div className="confirm" id="changePasswordConfirm">
            <p className="confirm__message">
              Change your password? You&apos;ll be signed out and will need to sign
              back in with the new one.
            </p>
            <div className="confirm__actions">
              <button
                ref={goBackRef}
                type="button"
                className="cancel"
                id="cancelPasswordChange"
                onClick={() => setConfirming(false)}
              >
                Go back
              </button>
              <button
                type="button"
                className="formSubmit"
                id="confirmPasswordChange"
                onClick={submitPasswordChange}
              >
                Yes, change it
              </button>
            </div>
          </div>
        ) : (
          <div id="buttons">
            <input
              className="formSubmit"
              type="submit"
              value="Change Password"
              id="changePasswordButton"
            />
            <a href="/content" className="cancel">
              Cancel
            </a>
          </div>
        )}
        <h3 className="warning hidden">
          <span className="errorMessage" />
        </h3>
      </form>
    </div>
  );
}
/**
 * Add react component to page.
 */
const init = () => {
  renderAtSelector('#content', <ChangePasswordWindow />);
};

window.onload = init;
