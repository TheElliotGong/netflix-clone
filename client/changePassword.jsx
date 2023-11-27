//import helper files.
const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
/**
 * This function handles changing the password for logged in user.
 * @param {*} e 
 * @returns 
 */
const handlePasswordChange = (e) => {
    e.preventDefault();
    // helper.hideError();
    //Get the passwords from the form.
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const currentPass = e.target.querySelector('#currentPass').value;
    //Ensure all fields are filled in and new password is valid.
    if(!pass || !pass2)
    {
        // helper.handleError('All fields are required.');
        return false;
    }
    if (pass !== pass2) {
        // helper.handleError('Passwords do not match.');
        return false;
    }
    helper.sendPost(e.target.action, {pass, pass2, currentPass });
    return false;
};
/**
 * Create the change password form
 * @param {*} props 
 * @returns 
 */
const ChangePasswordWindow = (props) => {
    return (
        <form id="changePasswordForm" onSubmit={handlePasswordChange} action='/changePassword' method="POST">
            <label htmlFor='currentPass'>Current Password: </label>
            <input id="currentPass" type="password" name="currentPass" placeholder="Current Password" />
            <label htmlFor="pass">New Password: </label>
            <input id="pass" type="password" name="pass" placeholder="New Password" />
            <label htmlFor="pass">Re-enter New Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="Re-enter New Password" />
            <input className="formSubmit" type="submit" value="Change Password" />
        </form>);
};
/**
 * Add react component to page.
 */
const init = () => {
    ReactDOM.render(<ChangePasswordWindow />, document.querySelector('#content'));
};

window.onload = init;