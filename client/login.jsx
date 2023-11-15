const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
/**
 * This function handles logging in for the domo 
 * @param {*} e 
 * @returns 
 */
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();
    //Get username and password from form and see if they're valid.
    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty.');
        return false;
    }
    //Send post request with data.
    helper.sendPost(e.target.action, { username, pass });
    return false;
};
/**
 * This function handles the sign up process for the domo maker.
 * @param {*} e 
 * @returns 
 */
const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();
    //Get username and password from form and see if they're valid.
    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    //Make sure all fields are filled in.
    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required.');
        return false;
    }
    //Make sure passwords match.
    if (pass !== pass2) {
        helper.handleError('Passwords do not match.');
        return false;
    }
    //Send post request with data.
    helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
};


/**
 * This function creates the login form for the domo maker.
 * @param {*} props 
 * @returns 
 */
const LoginWindow = (props) => {
    return (
        <div className = "formWindow">
            
           <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
            <h1>Sign In</h1>
            <input id="user" type="text" name="username" placeholder="Username" />

            <input id="pass" type="password" name="pass" placeholder="Password" />
            <input className="formSubmit" type="submit" value="Sign In" />

        </form> 
        <a id="signupButton" href="/signup" onClick={(e) => {e.preventDefault();
         ReactDOM.render(<SignupWindow />, document.querySelector('#content')); }}>Sign up</a>
        </div>
        
        
    );
};
/**
 * This function creates the signup form for the domo maker.
 * @param {*} props 
 * @returns 
 */
const SignupWindow = (props) => {
    
    return (
        <div className = "formWindow">
           <form id="signupForm" onSubmit={handleSignup} action="/signup" method="POST" className='mainForm'>
            <h1>Sign Up</h1>
            <label htmlFor='username'>Username: </label>
            <input id="user" type="text" name="username" placeholder="Username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Password" />
            <label htmlFor="pass">Re-enter Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="Re-enter Password" />
            <input className="formSubmit" type="submit" value="Sign Up" />
        </form> 
        <a id="loginButton" href="/login" onClick={(e) => {e.preventDefault(); ReactDOM.render(<LoginWindow />, document.querySelector('#content'));}}>Already have an account? <strong>Log In</strong></a>
        </div>
        
        
    );
};


window.onload = () => {ReactDOM.render(<LoginWindow />, document.querySelector('#content'));};