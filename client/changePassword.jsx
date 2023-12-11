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
    helper.hideError();
    //Get the passwords from the form.
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const currentPass = e.target.querySelector('#currentPass').value;
    //Ensure all fields are filled in and new password is valid.
    if(!pass || !pass2)
    {
        helper.handleError('All fields are required.');
        return false;
    }
    if (pass !== pass2) {
        helper.handleError('Passwords do not match.');
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
        //Create the form.
        <div className="formWindow">
            <h1>Change Password</h1>
        <form id="changePasswordForm" onSubmit={handlePasswordChange} action='/changePassword' method="POST" className = "mainForm">
            <input id="currentPass" type="password" name="currentPass" placeholder="Current Password" />
            <input id="pass" type="password" name="pass" placeholder="New Password" />
            <input id="pass2" type="password" name="pass2" placeholder="Confirm New Password" />
            <div id = "buttons">
                <input className="formSubmit" type="submit" value="Change Password" id = "changePasswordButton"/>
                <a href = "/content" className = "cancel">Cancel</a>
            </div>
            <h3 className = "warning hidden"><span className = "errorMessage"></span></h3>
        </form>
        </div>);
};
/**
 * Add react component to page.
 */
const init = () => {
    ReactDOM.render(<ChangePasswordWindow />, document.querySelector('#content'));
};

window.onload = init;